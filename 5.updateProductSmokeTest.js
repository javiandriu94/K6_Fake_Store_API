import http from 'k6/http'
import {check, sleep} from 'k6'
import { Counter } from 'k6/metrics'
import { randomIntBetween, randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
import createProduct from './2.createNewProductSmokeTest.js';

export const options = {
    vus:1,
    duration: '30s',
}

let httpError = new Counter('errorCounter')

export default function updateProductData() {
    const baseUrl = 'https://api.escuelajs.co/api/v1/';
     let createProductResponse = createProduct ();
    let newProductId = createProductResponse.productId;
    let requestBody = createProductResponse.requestBody;
   
    let newName = randomString(20);
    let newPrice = 125;
    let newDescription = "Change Description";
    requestBody.title = newName;
    requestBody.price = newPrice;
    requestBody.description = newDescription;
    
    let payload = JSON.stringify(requestBody);
        
        let params = {
            headers: {
                'Content-Type': 'application/json'
            },
            tags: {
                product:'update'
            }
            
        }
        let resUpdateProductId = http.put(`${baseUrl}products/${newProductId}`, payload, params);
        let productUpdatedID = resUpdateProductId.json().id
        sleep(randomIntBetween(1,5)) 

        if(resUpdateProductId.error){
            httpError.add(1, {product: 'update'}),
            check(resUpdateProductId, {
                'isStatus400': r => r.status === 400,
            },{product: 'update'})
            
        }else {
            check(resUpdateProductId, {
                'isStatus200': r => r.status === 200,
                'isProductUpdatedIdEqualToNewProductId': r => r.json().id === newProductId,
                'TheTitleNameWasChanged': r => r.json().title === newName,
                'ThePriceWasChanged': r => r.json().price === newPrice,
                'TheDescriptionWasChanged': r => r.json().description === newDescription,
                
            },
                {product: 'update'}
            )
        }
    
        

        let resGetProductUpdatedInTheList = http.get(`${baseUrl}products`, {
                tags: {
                    product:'isProductUpdatedExistInTheList',
                
                }
            });

            sleep(randomIntBetween(1,5))  
            
            if(resGetProductUpdatedInTheList.error) {
                httpError.add(1);
                check(resGetProductUpdatedInTheList,{
                    'isStatus400': r => r.status === 400
                }, {product:'isProductUpdatedExistInTheList'})
            }else {
                check(resGetProductUpdatedInTheList,{
                    'isStatus200': r => r.status === 200,
                    'producUpdatedId': r => {
                        const products = r.json(); 
                        const updatedProduct = products.find(p => p.id === productUpdatedID);
                        if (updatedProduct) {
                            check(updatedProduct, {
                                'TheTitleNameWasChanged': prod => prod.title === newName,
                                'ThePriceWasChanged': prod => prod.price === newPrice,
                                'TheDescriptionWasChanged': prod => prod.description === newDescription,
                            });
                            return true; 
                        }
                        return false;
                    }  
                },{product:'isProductUpdatedExistInTheList'})
            }
               
}