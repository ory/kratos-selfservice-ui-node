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

    export interface ProfileConfig {
        id: string
        expires_at: Date
        issued_at: Date
        request_url: string
        form: {
            action: string
            method: string
            fields: FormFields
        }
    }

    export interface AuthConfig {
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

    type FormFields = Array<FormField>

}