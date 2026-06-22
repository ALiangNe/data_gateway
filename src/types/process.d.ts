declare namespace NodeJS {
    interface ProcessEnv {
        DID_MANUALLY_SHUTDOWN?: string
    }

    interface Process {
        emit(event: 'SIGSTART', message: string): boolean

        on(
            event: 'SIGSTART',
            listener: (message: string) => void
        ): this
    }
}
