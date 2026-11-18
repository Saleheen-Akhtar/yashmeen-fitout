// Error messages, stacks and objects can contain credentials or customer data.
export function logError(operation, error) {
    const safeName = /^[A-Za-z][A-Za-z0-9]*Error$/.test(error?.name || '') ? error.name : 'Error';
    const code = /^[A-Z][A-Z0-9_]{0,40}$/.test(String(error?.code || '')) ? String(error.code) : undefined;
    console.error(JSON.stringify({ level: 'error', operation, type: safeName, ...(code ? { code } : {}) }));
}
export function logInfo(operation) { console.log(JSON.stringify({ level: 'info', operation })); }
