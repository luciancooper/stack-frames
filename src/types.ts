export interface Eval {
    origin: string | string[]
    loc: string
    file?: string
    line?: number
    col?: number
    native?: boolean
}

export interface StackFrame {
    loc: string
    ctor?: boolean
    async?: boolean
    func?: string
    method?: string
    type?: string
    file?: string
    line?: number
    col?: number
    native?: boolean
    eval?: Eval
}