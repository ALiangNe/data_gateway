import 'express'

declare module 'express-serve-static-core' {
  interface Request {
    user: {
      userId: string
      botId: string
      soulId: string
      role: number
      jti: string
    }
  }
}
