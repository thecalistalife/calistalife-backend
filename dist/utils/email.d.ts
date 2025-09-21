interface SendMailOptions {
    to: string;
    subject: string;
    html?: string;
    text?: string;
}
export declare const sendMail: ({ to, subject, html, text }: SendMailOptions) => Promise<void>;
export {};
//# sourceMappingURL=email.d.ts.map