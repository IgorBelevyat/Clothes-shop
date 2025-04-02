import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Items from "./components/items";


//remake so that when adding an image to the database, each image is named according to its category + number + 1
class App extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      orders: [],
      items: [
        {
          id: 1,
          title: 'T-short',
          img: 'T-short.jpg',
          desc: 'Lorem ipsum dolor',
          category: 'T-shorts',
          price: '49.58'
        },
        {
          id: 2,
          title: 'Hoodi',
          img: 'hoodie.jpg',
          desc: 'Lorem ipsum dolor',
          category: 'Hoodies',
          price: '149.58'
        }
      ]
    }
    this.addToOrder = this.addToOrder.bind(this)
    this.deleteOrder = this.deleteOrder.bind(this)
  }
  render () {
    return (
      <div className="wrapper">
        <Header orders={this.state.orders} onDelete={this.deleteOrder}/>
        <Items items={this.state.items} onAdd = {this.addToOrder}/>
        <Footer />
      </div>
    );
  }

//change this after addint database
  deleteOrder(id) {
    this.setState({orders: this.state.orders.filter(el => el.id !== id)})
  }


  //add a number of item wright in the box like (x2)
  addToOrder(item) {
    let isInArray = false
    this.state.orders.forEach(el => {
      if (el.id === item.id)
        isInArray = true
    })
    if(!isInArray)
      this.setState({ orders: [...this.state.orders, item]})
  }
}

export default App;
