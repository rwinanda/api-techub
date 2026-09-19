import midtransClient from 'midtrans-client';
import 'dotenv/config';

export const snap = new midtransClient.Snap({
    isProduction: false, // set true when you go live
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
});