import http from 'k6/http';
import {sleep, check} from 'k6';
import { Counter } from 'k6/metrics';

export const options = {
    stages: [
        {duration: '30s',target:100},
        {duration: '1m',target:100},
        {duration: '30s',target:0},
    ],
    thresholds: {
        http_req_duration: ['p(95) < 1000'],
        http_req_receiving: ['p(95) < 1000'],
        http_req_sending: ['p(95) < 1000'],
        errorCounter:['count<=1']
    }
};

let httpError = new Counter('errorCounter')

export default function () {
    const baseUrl = 'https://fakestoreapi.com/';
    let resProduct = http.get(`${baseUrl}products`);
    if(resProduct.error) {
        httpError.add(1);
        check(resProduct,{
            'isStatus400': r => r.status === 400
        })
    }else {
        check(resProduct,{
            'isStatus200': r => r.status === 200
        })
    }
    
    sleep(1)

    
}