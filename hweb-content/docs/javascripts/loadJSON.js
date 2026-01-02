(function() {
    'use strict';

    // ============================================
    // CONSTANTS
    // ============================================

    const LINK_SVG = '<span class="twemoji"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="m7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a1.998 1.998 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 1.998 1.998 0 0 0-2.83 0l-2.5 2.5a1.998 1.998 0 0 0 0 2.83Z"></path></svg></span>';

    const BASE_URL = 'https://raw.githubusercontent.com/';

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================

    /**
     * Formats a Date object as "YYYY-MM-DD HH:MM:SS"
     */
    function formatDate(date) {
        const pad = n => n.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
               `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    }

    /**
     * Returns human-readable age string (e.g., "5 day(s)" or "3 hour(s)")
     */
    function getAge(date) {
        const diffMs = Date.now() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 3600 * 24));
        if (diffDays === 0) {
            const diffHours = Math.floor(diffMs / (1000 * 3600));
            return `${diffHours} hour(s)`;
        }
        return `${diffDays} day(s)`;
    }

    /**
     * Safely escapes HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ============================================
    // DATA FETCHING
    // ============================================

    /**
     * Fetches JSON with fallback to alternative repositories
     * Returns a Promise that resolves with { data, repoName }
     */
    async function fetchJSONWithFallback(filename, reposToTry, repoIndex = 0) {
        if (repoIndex >= reposToTry.length) {
            throw new Error(`Failed to fetch ${filename} from all repository variants`);
        }

        const currentRepo = reposToTry[repoIndex];
        const url = BASE_URL + currentRepo + '/master/' + filename;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const data = await response.json();
            return { data, repoName: currentRepo };
        } catch (error) {
            // Log fallback attempt for debugging
            if (repoIndex + 1 < reposToTry.length) {
                console.info(`[loadJSON] Repository '${currentRepo}' not found for ${filename}, trying '${reposToTry[repoIndex + 1]}'...`);
            }
            // Try the next repository in the list
            return fetchJSONWithFallback(filename, reposToTry, repoIndex + 1);
        }
    }

    // ============================================
    // DOM RENDERING
    // ============================================

    /**
     * Builds HTML for a single tag row
     */
    function buildTagRow(tagData) {
        const { tags, description = '', last_updated, last_updated_url, latest } = tagData;
        const date = new Date(last_updated);

        const extraTag = latest
            ? '<div class="tag-decoration tag-decoration-latest">latest</div><br>'
            : '';

        const tagsHtml = tags
            .map(t => `<div class="tag-decoration">${escapeHtml(t)}</div>`)
            .join('<br>');

        const dateStr = formatDate(date);
        const lastUpdatedHtml = last_updated_url
            ? `<a href="${escapeHtml(last_updated_url)}" target="_blank">${dateStr}</a>`
            : dateStr;

        return `<tr>
            <td style="white-space:nowrap;">${extraTag}${tagsHtml}</td>
            <td>${escapeHtml(description)}</td>
            <td style="white-space:nowrap;">${lastUpdatedHtml}</td>
            <td>${getAge(date)}</td>
        </tr>`;
    }

    /**
     * Renders project links - single DOM operation
     */
    function renderLinks(data) {
        const container = document.getElementById('project-links');
        if (!container) return;

        // Get links array, defaulting to empty array if missing or invalid
        const links = (data && Array.isArray(data.links)) ? data.links : [];

        // If no links to display, hide the container
        if (links.length === 0) {
            container.style.display = 'none';
            return;
        }

        const linksHtml = links
            .map(link => `${LINK_SVG} <a href="${escapeHtml(link.url)}" class="header-icons" target="_blank" rel="noopener">${escapeHtml(link.name)}</a><br>`)
            .join('');

        container.innerHTML = linksHtml;
    }

    /**
     * Renders tags table - single DOM operation
     * Handles both array format and object format from tags.json
     */
    function renderTags(data) {
        const tbody = document.querySelector('#tags-table tbody');
        if (!tbody) return;

        // Handle both array format and object format
        // Object format: { "release": {...}, "legacy": {...} }
        // Array format: [{ tags: [...], ... }, ...]
        let entries;
        if (Array.isArray(data)) {
            entries = data;
        } else if (data && typeof data === 'object') {
            entries = Object.values(data);
        } else {
            console.warn('loadJSON: Unexpected tags data format');
            return;
        }

        const rowsHtml = entries
            .filter(tag => tag && tag.hide !== true)
            .map(tag => buildTagRow(tag))
            .join('');

        tbody.innerHTML = rowsHtml;
    }

    // ============================================
    // LOADING & ERROR STATES
    // ============================================

    function showLoadingState() {
        const tbody = document.querySelector('#tags-table tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;opacity:0.6;">Loading tags...</td></tr>';
        }

        const linksContainer = document.getElementById('project-links');
        if (linksContainer) {
            linksContainer.innerHTML = '<span style="opacity:0.6;">Loading links...</span>';
        }
    }

    function showError(type, message) {
        console.warn(`loadJSON error (${type}):`, message);

        if (type === 'tags' || type === 'all') {
            const tbody = document.querySelector('#tags-table tbody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#d32f2f;">Unable to load tags. Please refresh the page.</td></tr>';
            }
        }

        if (type === 'links' || type === 'all') {
            const linksContainer = document.getElementById('project-links');
            if (linksContainer) {
                linksContainer.innerHTML = '<span style="color:#d32f2f;">Unable to load links.</span>';
            }
        }
    }

    // ============================================
    // MAIN INITIALIZATION
    // ============================================

    async function init() {
        // Early bail-out: check if this is a container page
        const tagsTable = document.querySelector('#tags-table tbody');
        const projectLinks = document.getElementById('project-links');

        // If neither container element exists, this isn't a container page
        if (!tagsTable && !projectLinks) {
            return;
        }

        // Get image name from h1 element
        const h1 = document.getElementsByTagName('h1')[0];
        if (!h1) return;

        const image = h1.innerHTML;

        // Get header link elements (will be set after fetch determines the correct repository)
        const githubLink = document.getElementById('github-link');
        const ghcrioLink = document.getElementById('ghcrio-link');

        // Build repository fallback list
        const reposToTry = [image, image + '-docker'];

        // Show loading states
        showLoadingState();

        // Fetch both JSON files in parallel
        const [linksResult, tagsResult] = await Promise.allSettled([
            fetchJSONWithFallback('links.json', reposToTry),
            fetchJSONWithFallback('tags.json', reposToTry)
        ]);

        // Handle links result and update header links using the successful repository
        if (linksResult.status === 'fulfilled') {
            const { data, repoName } = linksResult.value;
            const splitRepo = repoName.split('/');

            // Update header links to point to the repository that was actually found
            if (githubLink) {
                githubLink.href = 'https://github.com/' + repoName;
            }
            if (ghcrioLink) {
                ghcrioLink.href = 'https://github.com/orgs/' + splitRepo[0] + '/packages/container/package/' + splitRepo[1];
            }

            renderLinks(data);
        } else {
            showError('links', linksResult.reason);
        }

        // Handle tags result
        if (tagsResult.status === 'fulfilled') {
            renderTags(tagsResult.value.data);
        } else {
            showError('tags', tagsResult.reason);
        }
    }

    // Run when DOM is ready
    // Use MkDocs Material's document$ observable for instant navigation support
    // Falls back to DOMContentLoaded for non-Material environments
    if (typeof document$ !== 'undefined') {
        // MkDocs Material with instant loading - runs on every navigation
        document$.subscribe(function() {
            init();
        });
    } else if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
