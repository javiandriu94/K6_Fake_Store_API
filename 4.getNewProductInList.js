import http from 'k6/http'
import {check, sleep} from 'k6'
import createProduct from './2.createNewProductSmokeTest.js';
import { Counter } from 'k6/metrics'
import { randomIntBetween} from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';


export const options = {
    vus:1,
    duration: '1m',

    thresholds: {
        http_req_duration: ['p(95) < 1000'],
        http_req_receiving: ['p(95) < 1000'],
        http_req_sending: ['p(95) < 1000'],
        errorCounter:['count<=1'],
        checks: ['rate>=0.99'],
        'http_req_duration{product:newProductInList}': ['p(95)<250'],
        'http_req_duration{product:create}': ['p(95)<250'],
        'errorCounter{product:newProductInList}': ['count===0'],
        'errorCounter{product:create}': ['count===0'],
        'checks{product:newProductInList}': ['rate>=0.99'],
        'checks{product:create}': ['rate>=0.99'],
    }
};

let httpError = new Counter('errorCounter')

export default function () {
    const baseUrl = 'https://api.escuelajs.co/api/v1/';
    let createProductResponse = createProduct ();
    let newProductId = createProductResponse.productId;
    
    let resGetAllProduct = http.get(`${baseUrl}products`, {
        tags: {
            product:'newProductInList',
        
        }
    });

    sleep(randomIntBetween(1,5))

    if(resGetAllProduct.error) {
        httpError.add(1);
        check(resGetAllProduct,{
            'isStatus400': r => r.status === 400
        }, {product:'newProductInList'})
    }else {
        check(resGetAllProduct,{
            'isStatus200': r => r.status === 200,
            'isNewProductIdInTheList': r =>  r.json().some(element => element.id === newProductId)
        },{product:'newProductInList'})
    }
      
}
