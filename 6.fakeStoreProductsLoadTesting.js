import http from 'k6/http'
import {check, sleep} from 'k6'
import { Counter } from 'k6/metrics'
import { randomIntBetween} from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import { SharedArray } from 'k6/data';




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
        errorCounter:['count<=1'],
        checks: ['rate>=0.99'],
        'http_req_duration{product:allProduct}': ['p(95)<250'],
        'http_req_duration{product:create}': ['p(95)<250'],
        'http_req_duration{product:productId}': ['p(95)<250'],
        'errorCounter{product:allProduct}': ['count===0'],
        'errorCounter{product:create}': ['count===0'],
        'errorCounter{product:productId}': ['count===0'],
        'checks{product:allProduct}': ['rate>=0.99'],
        'checks{product:create}': ['rate>=0.99'],
        'checks{product:productId}': ['rate>=0.99'],
    }
};

let httpError = new Counter('errorCounter')

const productDataArray = new SharedArray('product information', function () {
    return JSON.parse(open('./fixture/product.json')).products;
});

export default function () {
    const baseUrl = 'https://api.escuelajs.co/api/v1/';
    let product = { ...productDataArray[0] };
    let newPrice = Math.floor(Math.random() * 100) + 1
    let newCategoryId = Math.floor(Math.random() * (5 - 1 + 1)) + 1
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
        let newProductId = resCreateNewProduct.json().id;
        
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
                'DoesTheSlugExist': r => r.json().slug === r.json().title.toLowerCase(),
                'DoesCategoryExist': r => r.json().category.id === newCategoryId,
                'categoryName': r => {
                const category = r.json().category;
                if (category.id === 1 && category.name === "Clothes" ) {
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
        sleep(randomIntBetween(1,5));

        let resGetProductById = http.get(`${baseUrl}products/` + newProductId, {
            tags: {
                product: 'productId'
            }
        });

        if(resGetProductById.error){
            httpError.add(1, {product: 'productId'}),
            check(resGetProductById, {
                'isStatus400': r => r.status === 400,
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
    
    
    let resGetAllProduct = http.get(`${baseUrl}products`, {
        tags: {
            product:'allProduct',
        
        }
    });
    if(resGetAllProduct.error) {
        httpError.add(1);
        check(resGetAllProduct,{
            'isStatus400': r => r.status === 400
        }, {product:'allProduct'})
    }else {
        check(resGetAllProduct,{
            'isStatus200': r => r.status === 200,
            'isNewProductIdInTheList': r =>  r.json().some(element => element.id === newProductId)
        },{product:'allProduct'})
    }
    
    sleep(randomIntBetween(1,5))




   

}



export default function () {
    const baseUrl = 'https://api.escuelajs.co/api/v1/';
    let product = { ...productDataArray[0] };
    let newPrice = Math.floor(Math.random() * 100) + 1
    let newCategoryId = Math.floor(Math.random() * (5 - 1 + 1)) + 1
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
        let newProductId = resCreateNewProduct.json().id;
        
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
                'DoesTheSlugExist': r => r.json().slug === r.json().title.toLowerCase(),
                'DoesCategoryExist': r => r.json().category.id === newCategoryId,
                'categoryName': r => {
                const category = r.json().category;
                if (category.id === 1 && category.name === "Clothes" ) {
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
        sleep(randomIntBetween(1,5));

        let resGetProductById = http.get(`${baseUrl}products/` + newProductId, {
            tags: {
                product: 'productId'
            }
        });

        if(resGetProductById.error){
            httpError.add(1, {product: 'productId'}),
            check(resGetProductById, {
                'isStatus400': r => r.status === 400,
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
