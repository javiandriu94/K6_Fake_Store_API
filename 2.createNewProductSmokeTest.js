import http from 'k6/http'
import {check, sleep} from 'k6'
import { Counter } from 'k6/metrics'
import { randomIntBetween, randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { SharedArray } from 'k6/data';

export const options = {
    vus:1,
    duration: '30s',
}

let httpError = new Counter('errorCounter')

const productDataArray = new SharedArray('product information', function () {
    return JSON.parse(open('./fixture/product.json')).products;
});
export default function createNewProduct() {
    const baseUrl = 'https://api.escuelajs.co/api/v1/';
    let product = { ...productDataArray[0] };
    let newName = randomString(10)
    let newPrice = Math.floor(Math.random() * 100) + 1
    let newCategoryId = Math.floor(Math.random() * (5 - 1 + 1)) + 1
    product.title = newName;
    product.price = newPrice;
    product.categoryId = newCategoryId;
        
    let payload = JSON.stringify(product);
        
        let params = {
            headers: {
                'Content-Type': 'application/json'
            },
            tags: {
                product:'create'
            }
            
        }
        let resCreateNewProduct = http.post(`${baseUrl}products`, payload, params);
        let newProductId = resCreateNewProduct.json().id
        console.log(JSON.stringify(resCreateNewProduct.json()));

        if(resCreateNewProduct.error){
            httpError.add(1, {product: 'create'}),
            check(resCreateNewProduct, {
                'isStatus400': r => r.status === 400,
            },{product: 'create'})
            
        }else {
            check(resCreateNewProduct, {
                'isStatus200': r => r.status === 201,
                'isIdAnInteger': r => typeof r.json().id === 'number',
                'isTitleAString': r => typeof r.json().title === 'string',
                'isPriceAnInteger': r => typeof r.json().price === 'number',
                'isDescriptionAString': r => typeof r.json().description === 'string',
                'DoesTheSlugExist': r => r.json().slug === r.json().title.toLowerCase().replace(/\s+/g, '-'),
                'DoesCategoryExist': r => r.json().category.id === newCategoryId,
                'categoryName': r => {
                const category = r.json().category;
                if (category.id === 1 && (category.name === "Clothes" || category.name === "Games")  ) {
                    return true;
                }else if (category.id === 2 && category.name === "Electronics") {
                    return true ;
                } else if (category.id === 3 && category.name === "Furniture") {
                    return true;
                }else if (category.id === 4 && category.name === "Shoes") {
                    return true;
                }else if (category.id === 5 && category.name === "Miscellaneous") {
                    return true
                }else {
                    return false;
                }
                
            }
            },
                {product: 'create'}
            )
        }
    
        sleep(randomIntBetween(1,5)) 

        if (resCreateNewProduct.status === 201) {
            return newProductId;
        } else {
            return null;
        }
        
        
        
          
}