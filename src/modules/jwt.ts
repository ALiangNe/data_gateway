/**
 * JWT utilities: load/get public key, verify signature
 */
import jwt from 'jsonwebtoken'
import { existsSync, mkdirSync, accessSync, readFileSync, constants, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { generateKeyPairSync } from 'node:crypto'
import axios from 'axios'
import type { JwtPayload } from 'jsonwebtoken'

let authHost: string | undefined
let authPort: number | undefined
let publicKey: Buffer | string
let privateKey: Buffer | string

type PrepareKeyPairOptions = {
    host?: string
    port?: number
    keypath?: string
}

/**
 * Get keypair from auth center or load from local path
 * @param options configuration options
 * @param options.host auth center host (optional)
 * @param options.port auth center port (optional)
 * @param options.keypath local key path (optional)
 * @returns public key
 */
export const prepareKeyPair = async (options: PrepareKeyPairOptions) => {
    const { host, port, keypath } = options

    if (!host && !port && !keypath) throw 'MISSING_REQUIRED_OPTIONS'
    if (!keypath && (!host || !port)) throw 'MISSING_AUTH_OPTIONS'

    if (!keypath && host && port) {
        authHost = host
        authPort = port
        let res
        try {
            res = await axios.get(`http://${host}:${port}/key/public`)
        } catch {
            throw 'FAILED_LOAD_PUBLIC_KEY'
        }
        publicKey = res.data.data
        return publicKey
    }

    if (!keypath) throw 'MISSING_KEYPATH'
    if (!existsSync(keypath)) {
        try { mkdirSync(keypath, { recursive: true }) } catch { throw 'FAILED_CREATE_KEYPAIR_PATH' }
    }

    let fileExists: boolean
    try {
        await accessSync(resolve(keypath, 'pub.pem'), constants.R_OK)
        fileExists = true
    } catch {
        fileExists = false
    }

    if (!fileExists) {
        const res = generateKeyPairSync('rsa', {
            modulusLength: 4096,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        })
        publicKey = res.publicKey
        privateKey = res.privateKey
        writeFileSync(resolve(keypath, 'pub.pem'), Buffer.from(publicKey))
        writeFileSync(resolve(keypath, 'key.pem'), Buffer.from(privateKey))
    } else {
        publicKey = readFileSync(join(keypath, 'pub.pem'), { encoding: 'utf8' })
        privateKey = readFileSync(join(keypath, 'key.pem'), { encoding: 'utf8' })
    }
}

/**
 * Verify JWT signature
 * @param token JWT token string
 * @returns decoded payload
 * @throws FAILED_VERIFY_JWT or PUBLIC_KEY_NOT_READY
 */
export const verifyJwt = (token: string): JwtPayload | string => {
    if (!publicKey && authHost && authPort) {
        throw 'PUBLIC_KEY_NOT_READY'
    }
    try {
        const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] })
        return decoded
    } catch {
        throw 'FAILED_VERIFY_JWT'
    }
}
