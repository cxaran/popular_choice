declare module 'qrcode.react' {
    import * as React from 'react';

    export interface QRCodeSVGProps {
        value: string;
        size?: number;
        level?: "L" | "M" | "Q" | "H";
        bgColor?: string;
        fgColor?: string;
        style?: React.CSSProperties;
        includeMargin?: boolean;
        imageSettings?: {
            src: string;
            height: number;
            width: number;
            excavate: boolean;
        };
    }

    export const QRCodeSVG: React.FC<QRCodeSVGProps>;
    export const QRCodeCanvas: React.FC<QRCodeSVGProps>;
}