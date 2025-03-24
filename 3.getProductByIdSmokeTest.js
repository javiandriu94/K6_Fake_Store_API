import http from 'k6/http'
import createNewProduct from './2.createNewProductSmokeTest';
import {check, sleep} from 'k6'
import { Counter } from 'k6/metrics'
import { randomIntBetween} from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { SharedArray } from 'k6/data';

export const options = {
    vus:1,
    duration: '1m',

    thresholds: {
        http_req_duration: ['p(95) < 1000'],
        http_req_receiving: ['p(95) < 1000'],
        http_req_sending: ['p(95) < 1000'],
        errorCounter:['count<=1'],
        checks: ['rate>=0.99'],
        'http_req_duration{product:create}': ['p(95)<250'],
        'http_req_duration{product:productId}': ['p(95)<250'],
        'errorCounter{product:create}': ['count===0'],
        'errorCounter{product:productId}': ['count===0'],
        'checks{product:create}': ['rate>=0.99'],
        'checks{product:productId}': ['rate>=0.99']
    }

    
}

let httpError = new Counter('errorCounter')

const productDataArray = new SharedArray('product information', function () {
    return JSON.parse(open('./fixture/product.json')).products;
});
export default function () {
    const baseUrl = 'https://api.escuelajs.co/api/v1/';
    let newProductId = createNewProduct ();
    
    let resGetProductById = http.get(`${baseUrl}products/` + newProductId, {
        tags: {
            product: 'productId'
        }
    });

    if(resGetProductById.error){
        httpError.add(1, {product: 'productId'}),
        check(resGetProductById, {
            'isStatus400': r => r.status === 400,
            'isErrorMessage': r => r.json().message === "Validation failed (numeric string is expected)"
        }, {product: 'productId'})
        }else {
            check(resGetProductById, {
                'isStatus200': r => r.status === 200,
                'isIdChecked': r => r.json().id === newProductId
            }, 
                {product: 'productId'}
            )
        }
        
    
        sleep(randomIntBetween(1,5))
}
