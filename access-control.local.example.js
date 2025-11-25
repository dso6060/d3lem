/**
 * Local-only access control overrides.
 *
 * Copy this file to `access-control.local.js` and update the password/IP
 * restrictions you want to enforce on your personal deployment. The `.gitignore`
 * entry makes sure the real password never ends up in a commit.
 */
(function registerLocalAccessControlOverrides() {
    const overrides = {
        // Replace with your desired edit-table password. Leave empty to disable auth.
        password: "replace-me-with-a-strong-password",
        // Optional: restrict edit access to specific IPs (future enhancement).
        ipWhitelist: [],
        enableIPCheck: false
    };

    if (window.applyAccessControlOverrides) {
        window.applyAccessControlOverrides(overrides);
    } else {
        window.pendingAccessControlOverrides = overrides;
    }
})();


