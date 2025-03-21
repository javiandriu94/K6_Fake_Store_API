import http from 'k6/http'
import {check, sleep} from 'k6'
import { Counter } from 'k6/metrics'
import { randomIntBetween, randomItem  } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
    vus:1,
    duration: '1m'
}

let httpError = new Counter('error_counter')
export default function () {
    const baseUrl = 'https://fakestoreapi.com/';
    let randomProductId = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]

    let resGetProductById = http.get(`${baseUrl}products/` + randomItem(randomProductId), {
        tags: {
            product: 'productId'
        }
    });
    let productId = resGetProductById.json().id;
    let productTitle = resGetProductById.json().title;
    let productPrice = resGetProductById.json().price;
    let productDescription = resGetProductById.json().description;
    let productCategory = resGetProductById.json().category

    if(resGetProductById.error){
        httpError.add(1, {product: 'productId'}),
        check(resGetProductById, {
            'isStatus400': r => r.status === 400,
        }, {product: 'productId'})
    }else {
        check(resGetProductById, {
            'isStatus200': r => r.status === 200,
            'isIdChecked': r => r.json().id === productId,
            'isIdIncludedInRandomProductId': r => randomProductId.includes(r.json().id),
            'isTitleChecked': r => r.json().title === productTitle,
            'isPriceChecked': r => r.json().price === productPrice,
            'isDescriptionChecked': r => r.json().description === productDescription,
            'isCategoryChecked': r => r.json().category === productCategory
        }, 
            {product: 'productId'}
        )
    }
    

    sleep(randomIntBetween(1,5))
}