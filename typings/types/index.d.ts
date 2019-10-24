declare module 'types' {
    type FormError = {
        code: number
        message: string
        field: string
    }

    interface RequestMethod<T> {
        method: string
        config: T
        Errors: FormError[]
    }

    export type Errors = Object[]

    export interface Config {
        id: string
        return_to: string
        issued_at: Date
        expires_at: Date
        active: string
        methods: {
            password: RequestMethod<FormConfig>
            oidc: RequestMethod<FormConfig & {
                providers: FormField[]
            }>
        }
    }

    type FormField = {
        value?: string
        type: string
        required?: boolean
        label?: string
        error?: FormError
        name: string
    }

    interface FormConfig {
        errors?: FormError[]
        action: string
        fields: FormFields
    }

    type FormFields = { [key: string]: FormField }

}