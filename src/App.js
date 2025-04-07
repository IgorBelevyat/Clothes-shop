import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Items from "./components/items";
import Catagories from "./components/Catagories";
import ShowFullItem from "./components/ShowFullItem";


//remake so that when adding an image to the database, each image is named according to its category + number + 1
class App extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      orders: [],
      currentItems: [],
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
      ],
      showFullItem: false,
      fullItem: {}
    }
    this.state.currentItems = this.state.items
    this.addToOrder = this.addToOrder.bind(this)
    this.deleteOrder = this.deleteOrder.bind(this)
    this.chooseCategory = this.chooseCategory.bind(this)
    this.onShowItem = this.onShowItem.bind(this)
  }
  render () {
    return (
      <div className="wrapper">
        <Header orders={this.state.orders} onDelete={this.deleteOrder}/>
        <Catagories chooseCategory={this.chooseCategory}/>
        <Items onShowItem={this.onShowItem} items={this.state.currentItems} onAdd = {this.addToOrder}/>
        {this.state.showFullItem && <ShowFullItem onAdd = {this.addToOrder} onShowItem={this.onShowItem} item ={this.state.fullItem}/>}
        <Footer />
      </div>
    );
  }


  onShowItem(item) {
    this.setState({fullItem: item})
    this.setState({showFullItem: !this.state.showFullItem})
  }

  chooseCategory(category) {
    if (category === 'all'){
      this.setState({currentItems: this.state.items})
      return
    }
    
    this.setState({
      currentItems: this.state.items.filter(el => el.category === category)
    })
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
