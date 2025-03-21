import http from 'k6/http'
import {check, sleep} from 'k6'
import { Counter } from 'k6/metrics'
import { randomIntBetween, randomString, randomItem  } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
    vus:1,
    duration: '1m',
}

let httpError = new Counter('error_counter')
export default function () {
    const baseUrl = 'https://fakestoreapi.com/';
        let categories = ['Ropa, Cosméticos', 'Muebles', 'Electrodomésticos', 'Artículos para el hogar', 'Juguetes', 'Ferretería', 'Jardinería', 'Artículos deportivos', 'Artículos de tocador'];
        let newProduct = {
            title: randomString(8),
            price: randomIntBetween(100,500),
            description: randomString(56),
            category: randomItem(categories),
            image: 'http://example.com'
        }
        let payload = JSON.stringify(newProduct);
    
        let params = {
            headers: {
                'Content-Type': 'application/json'
            },
            tags: {
                product:'create'
            }
            
        }
        let resCreateNewProduct = http.post(`${baseUrl}products`, payload, params);
        let newProductTitle = resCreateNewProduct.json().title;
        let newProductPrice = resCreateNewProduct.json().price;
        let newProductDescription = resCreateNewProduct.json().description;
        let newProductCategory = resCreateNewProduct.json().category
        
        if(resCreateNewProduct.error){
            httpError.add(1, {product: 'create'}),
            check(resCreateNewProduct, {
                'isStatus400': r => r.status === 400,
            },{product: 'create'})
        }else {
            check(resCreateNewProduct, {
                'isStatus200': r => r.status === 200,
                'isIdAnInteger': r => typeof r.json().id === 'number',
                'isTitleAString': r => typeof r.json().title === 'string',
                'isPriceAnInteger': r => typeof r.json().price === 'number',
                'isDescriptionAString': r => typeof r.json().description === 'string',
                'isCategoryAString': r => typeof r.json().category === 'string',
                'isCategoryBelongsToCategory': r => categories.includes(r.json().category),
                'DoesTheIdExist': r => r.json().id === 21,
                'DoesTheTitleExist': r => r.json().title === newProductTitle,
                'DoesThePriceExist': r => r.json().price === newProductPrice,
                'DoesTheDescriptionExist': r => r.json().description === newProductDescription,
                'DoesCategoryExist': r => r.json().category === newProductCategory
            },
                {product: 'create'}
            )
        }
        sleep(randomIntBetween(1,5)) 
}