let _ethers;
let _thirdweb;

export async function fetchExternals() {
    try {
        _ethers = await import("https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.min.js");
        _thirdweb = await import("https://cdn.jsdelivr.net/npm/thirdweb@5.52.0/+esm");
        return true
    } catch (err) {
        return false
    }
}

const makeProxy = (targeter) => new Proxy({}, {
    get(_, prop) {
        const target = targeter()
        const value = target?.[prop]
        return value ? value.bind(target) : () => {}
    }
})

export const ethers = makeProxy(() => _ethers?.ethers)
export const thirdweb = makeProxy(() => _thirdweb)