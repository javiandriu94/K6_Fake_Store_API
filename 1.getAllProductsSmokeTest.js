import http from 'k6/http';
import {sleep, check} from 'k6';
import { Counter } from 'k6/metrics';

export const options = {
    vus:1,
    duration: '1m',
    thresholds: {
        errorCounter:['count<=1']
    }
};

let httpError = new Counter('errorCounter')

export default function () {
    const baseUrl = 'https://api.escuelajs.co/api/v1/';
    let resProduct = http.get(`${baseUrl}products`);
    sleep(1)
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
    
    

    
}