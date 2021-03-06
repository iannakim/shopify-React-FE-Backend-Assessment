import React from 'react';
import {Route, Switch, withRouter, Redirect} from 'react-router-dom'

import HomePage from './Components/HomePage'
import Products from './Components/Products'
import LogInForm from './Components/LogInForm'
import RegisterForm from './Components/RegisterForm'
import MySpace from './Components/MySpace'
import NewProductContainer from './Components/UserComponents/NewProductContainer'
import Banner from './Components/Banner'
import Cart from './Components/Cart'

import 'semantic-ui-css/semantic.min.css'
import {Button} from 'semantic-ui-react'

import './App.css';
import UserProducts from './Components/UserComponents/UserProducts';


class App extends React.Component {

  state = {
    products: [],
    user_id: '',
    first_name: '',
    token: '',
    newProductMessage: '',
    tempCart: [],
    productsIbought: [],
    cart_id: '',
    productsOnCart: [],
    purchaseProducts: []
  }


  componentDidMount = () => {
    fetch('https://snapupy-app-api.herokuapp.com/products')
    .then(res => res.json())
    .then(productsArray => {
      this.setState({ products: productsArray })
    })

    if(localStorage.token){
      fetch('https://snapupy-app-api.herokuapp.com/users/keep_logged_in', {
        method: 'GET',
        headers: {
          'Authorization': localStorage.token
        }
      })
      .then(res => res.json())
      .then(this.helpHandleLogInResponse)
    }

  }

  // LOGIN HANDLER 
  handleLoginSubmission = (userInfo) => {
    fetch("https://snapupy-app-api.herokuapp.com/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "Application/json"
      },
      body: JSON.stringify({
        first_name: userInfo.first_name,
        password: userInfo.password
      })
    })
    .then(res => res.json())
    .then(this.helpHandleLogInResponse)
  }

  // REGISTER HANDLER 
  handleRegisterSubmit = (userInfo) => {
    console.log("Register form has been submitted!")
    fetch('https://snapupy-app-api.herokuapp.com/users', {
      method: "POST",
      headers: {
        'Content-Type': 'Application/json'
      },
      body: JSON.stringify({
        first_name: userInfo.first_name,
        last_name: userInfo.last_name,
        password: userInfo.password,
        phone: userInfo.phone, 
        capital: 0,
        address: userInfo.address,
        token: userInfo.token
      })
    })
    .then(res => res.json())
    .then(res => {
      if(res.error){
        console.error(res.error)
      } else {
        localStorage.token = res.token
        this.setState({
          first_name: res.user.first_name,
          user_id: res.user.id,
          token: res.token
        })

        fetch('https://snapupy-app-api.herokuapp.com/carts', {
      method: 'POST',
      headers: {
        'Content-Type': 'Application/json',
        "authorization": this.state.token
      },
      body: JSON.stringify({
        bought: false
      })
    })
    .then(res => res.json())
    .then(cartPojo => {
      this.setState({
        cart_id: cartPojo.id
      })
    })
        this.props.history.push('./myspace')
      }
    })
  }

  // LOGOUT HANDLER 
handleLogOut = () => {
  this.setState({
    user_id: 0,
    first_name: '',
    token: '',
    newProductMessage: '',
    cart_id: ''
  })
  localStorage.clear()
}

// HELPER LOGIN FUNCTION
helpHandleLogInResponse = (res) => {
  if(res.error) {
    console.error(res.error)
  } else {
    console.log(res)
    localStorage.token = res.token
    this.setState({
      user_id: res.user.id,
      first_name: res.user.first_name,
      token: res.token,
      productsIbought: res.user.productsIbought,
      cart_id: (res.user.carts.map(cart => cart.id).toString())
    })
    this.props.history.push('/myspace')
  }
}

  // LOGIN / REGISTER FORM ------------------
  renderForm = (routerProps) => {
    if(this.state.token){
      return <Button id='logOutButton' inverted color='red' onClick={this.handleLogOut}>
      Are you sure to log out {this.state.first_name}?
    </Button>
    }
    if(routerProps.location.pathname === "/login"){
      return <LogInForm
              formName="Login Form"
              handleSubmit={this.handleLoginSubmission}
            />
     } else if (routerProps.location.pathname === "/register") {
      return <RegisterForm
              formName="Register Form"
              handleRegisterSubmit={this.handleRegisterSubmit}
            />
    } 
  }

  updateCartId = (newCartId) => {
    this.setState({
      cart_id: newCartId
    })

  }



  // UPDATE PRODUCTS ON CARD

  updateProductsOnCart = (newProduct) => {
    let copyofProductsOnCart = [...this.state.productsOnCart, newProduct]
    this.setState({
      productsOnCart: copyofProductsOnCart
    })
  }
  // ADD ORDER TO TEMP-CART
  ordersToCart = () =>{
    return <Cart 
    current_user = {this.state.user_id}
    token = {this.state.token}    
    cart_id = {parseInt(this.state.cart_id)}
    updateCartId = {this.updateCartId}
    productsOnCart = {this.state.productsOnCart}
    purchaseProducts = {this.purchaseProduts}
    userProducts = {this.state.products.filter(product => product.user_id === this.state.user_id)}


    />
  }

  // UPDATE PRODUCTS 
  addProduct = (product) => {
    let copyOfProducts = [...this.state.products, product]
    this.setState({
      products: copyOfProducts, 
      newProductMessage: "You have created a new Product"
    })
    this.resetNewProductMessage()
  }

  resetNewProductMessage = () => {
    setTimeout( () =>this.setState({
      newProductMessage: ''
    }), 4000)

  }

  // UPDATE STATE WHEN DELETING A PRODUCT
  deleteProductFromState = (deletedId) => {
    let copyOfProducts = this.state.products.filter(productObj => {
      return productObj.id !== deletedId
    })
    this.setState({ products: copyOfProducts})
  }

  // UPDATE PRODUCTS I BOUGHT
  addProductsIBoughtToMyList = (newProductIbought) => {
    let copyOfProdutsIBought = [...this.state.productsIbought, newProductIbought]
    this.setState({
      productsIbought: copyOfProdutsIBought
    })
  }

  // UPDATE PURCHASE PRODUCTS
  purchaseProduts = (product) => {
    let copyOfPurchaseProducts = [...this.state.purchaseProducts, product]
    this.setState({
      purchaseProducts: copyOfPurchaseProducts
    })

  }

  // PROFILE - MY SPACE - COMPONENT
  renderMySpace = (routerProps) => {
    if (this.state.token) {
      return <div>
        <MySpace 
        first_name = {this.state.first_name}
        token = {this.state.token}
        current_user = {this.state.user_id}
        addProduct = {this.addProduct} 
        userProducts = {this.state.products.filter(product => product.user_id === this.state.user_id)}
        productsIbought = {this.state.productsIbought} 
        cart_id = {parseInt(this.state.cart_id)}
        />
      </div>
    } else {
      return <Redirect to='/login' />
    }
  }

  createNewProduct = (routerProps) => {
    if(this.state.token) {
      return <div>
        <NewProductContainer 
        token = {this.state.token}
        addProduct = {this.addProduct}
        />
      </div>
    }else {
      return <Redirect to='/login' />
    }
  }


  renderProducts = (routerProps) => {
    return <div>
      <Products
        token = {this.state.token}
        products = {this.state.products}
        current_userID = {this.state.user_id}
        tempCart = {this.addOrderToTempCart}
        cart_id = {parseInt(this.state.cart_id)}
        updateProductsOnCart = {this.updateProductsOnCart}
        />
    </div>
  }

  currentUserProducts = (routerProps) => {
    let currentUser = this.state.user_id
    let currentUserProducts = this.state.products.filter(product => {
      if(product.user_id === currentUser){
        return product
      }
    })
    return (
      <div>
    <UserProducts 
    deleteProductFromState = {this.deleteProductFromState}
    currentUserProducts = {currentUserProducts}
    newProductMessage = {this.state.newProductMessage}
    />
    </div>
    )
  }

  render() {

    console.log(this.state.purchaseProducts)
    
    return (
      <div>
        <Banner token = {this.state.token}
                name = {this.state.first_name} />
        
        <main>
          <Switch>
            <Route path='/cart' exact render = {this.ordersToCart} />
            <Route path ='/myspace/products/new' exact render ={this.createNewProduct} />
            <Route path='/myspace/products' exact render= {this.currentUserProducts} />
            <Route path='/products' exact render = {this.renderProducts} />
            <Route path='/' exact component ={HomePage} />
            <Route path='/login' exact render= {this.renderForm} />
            <Route path='/register' exact render={this.renderForm} />
            <Route path='/myspace' exact render = {this.renderMySpace} />

          </Switch>
        </main>

      </div>

    );
  }
}

export default withRouter(App);
