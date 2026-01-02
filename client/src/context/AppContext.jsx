import { useEffect } from "react";
import {createContext,useContext,useState} from "react";
import{useNavigate} from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials= true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext = createContext();

export const AppContextProvider=({children})=>{

const currency =import.meta.env.VITE_CURRENCY;    
const navigate=useNavigate();//use to redirect user
const[user,setUser]=useState(null)
const[isSeller,setIsSeller]=useState(false)
const[showUserLogin,setShowUserLogin]=useState(false)
const[products,setProducts]=useState([])
const [cartItems,setCartItems]=useState({})
const[searchQuery,setSearchQuery]=useState({})


//Fetch Seller Status

const fetchSeller = async ()=>{  //to check whether logged in user is seller or not
    try {
        const { data } = await axios.get('/api/seller/is-auth');
        if( data.success)
        {
            setIsSeller(true)
        }
        else
        {
            setIsSeller(false)
        }
        
    } catch (error) {
        setIsSeller(false);
        
    }
}

//Fetch User Auth Status , User Data and Cart items

const fetchUser = async()=>{
    try {
        const { data } = await axios.get('api/user/is-auth');
        if(data.success){
            setUser(data.user)// set user data
            setCartItems(data.user.cartItems) //Loads saved cart
        }
        
    } catch (error) {
        setUser(null) //clears user on failure
        
    }
}




//Fetch All Product
const fetchProducts=async()=>{
try {
    const { data } = await axios.get('/api/product/list') //Get request to fetch all products
    if (data.success) {
        setProducts(data.products)  
    }
    else{
        toast.error(data.message)
    }
} catch (error) {

    toast.error(error.message);
}}
//Add product to cart 
const addToCart=(itemId)=>{

    let cartData=structuredClone(cartItems);
    if(cartData[itemId])// is product is already in cart?
    {
        cartData[itemId] +=1;
    }
    else{
        cartData[itemId]=1;// first time adding product to cart
    }
    setCartItems(cartData);
    toast.success("Added to Cart")
}

//update cart item quantity
const updateCartItem =(itemId,quantity)=>{
   let cartData=structuredClone(cartItems) ;
   cartData[itemId]=quantity;
   setCartItems(cartData)
   toast.success("Cart Updated")
}
//remove product from cart
const removeFromCart=(itemId)=>{

    let  cartData=structuredClone(cartItems);
    if(cartData[itemId]){
        cartData[itemId]-=1;
        if(cartData[itemId] ==0){
            delete cartData[itemId];
        }
    }
    toast.success("Removed from Cart")
    setCartItems(cartData)
}
//get cart item count function

const getCartCount=()=>{ // sum quantity
    let totalCount=0;
    for(const item in cartItems)
    {
        totalCount +=cartItems[item];
    }
    return totalCount;
}

//Get cart total amount
const getCartAmount=()=>{
    let totalAmount=0;
    for(const items in cartItems)
    {
        let itemInfo=products.find((product)=> product._id===items); //from all products , find the one whose ID matches the cart item
        if(cartItems[items]>0)
        {
            totalAmount +=itemInfo.offerPrice * cartItems[items]
        }
    }
    return Math.floor(totalAmount * 100)/100; // rounding off to 2 decimal places
}

useEffect( ()=>{
    fetchUser()
    fetchSeller()
    fetchProducts()
},[]) // useEffect runs only once when app loads to fetch initail data like user auth , seller status and product list 

// Update Database Cart items
useEffect(()=>{
   
   const updateCart = async()=>{
    try {
        const { data } = await axios.post('/api/cart/update' , { userId:user._id,  cartItems}) // send updated cart items to backend and tell it to please save it 
        if(!data.success){
            toast.error(data.message)
        }
        
    } catch (error) {
        toast.error(error.message)
    }
   } 
   if(user){ // only runs if user exists 
    updateCart()
   } 

},[cartItems])

const value={navigate,user,setUser,setIsSeller,isSeller,showUserLogin,setShowUserLogin,products,currency,addToCart,updateCartItem,removeFromCart, cartItems,searchQuery,setSearchQuery,getCartAmount,getCartCount,axios,fetchProducts,setCartItems}
//collecting all global data and func into one obj


return<AppContext.Provider value={value}>
    {children}
</AppContext.Provider>



}

export const useAppContext=()=>{
return useContext(AppContext)
}