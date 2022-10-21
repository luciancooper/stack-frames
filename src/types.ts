export interface StackFrame {
    async?: true
    ctor?: true
    func?: string
    method?: string
    type?: string
    file?: string
    line?: number
    col?: number
    native?: true
    loc?: string
    evalOrigin?: string | string[]
    evalFile?: string
    evalLine?: number
    evalCol?: number
    evalNative?: true
    evalLoc?: string
}