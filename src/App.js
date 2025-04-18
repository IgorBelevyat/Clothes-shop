import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Items from "./components/items";
import Catagories from "./components/Catagories";
import ShowFullItem from "./components/ShowFullItem";
import Register from "./components/Register";
import { withRouter } from "./components/withRouter"; 

class App extends React.Component {
  constructor(props) {
    super(props);
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
    };
    this.addToOrder = this.addToOrder.bind(this);
    this.deleteOrder = this.deleteOrder.bind(this);
    this.chooseCategory = this.chooseCategory.bind(this);
    this.onShowItem = this.onShowItem.bind(this);
  }

  componentDidMount() {
    this.setState({ currentItems: this.state.items });
  }

  deleteOrder(id) {
    this.setState({ orders: this.state.orders.filter(el => el.id !== id) });
  }

  addToOrder(item) {
    if (!this.state.orders.some(el => el.id === item.id)) {
      this.setState({ orders: [...this.state.orders, item] });
    }
  }

  chooseCategory(category) {
    if (category === 'all') {
      this.setState({ currentItems: this.state.items });
    } else {
      this.setState({
        currentItems: this.state.items.filter(el => el.category === category)
      });
    }
  }

  onShowItem(item) {
    this.setState({ fullItem: item, showFullItem: !this.state.showFullItem });
  }

  render() {
    const { location } = this.props.router;
    const isRegisterPage = location.pathname === "/register";

    return (
      <div className="wrapper">
        {!isRegisterPage && (
          <Header orders={this.state.orders} onDelete={this.deleteOrder} />
        )}

        <Routes>
          <Route
            path="/"
            element={
              <>
                <Catagories chooseCategory={this.chooseCategory} />
                <Items
                  onShowItem={this.onShowItem}
                  items={this.state.currentItems}
                  onAdd={this.addToOrder}
                />
                {this.state.showFullItem && (
                  <ShowFullItem
                    onAdd={this.addToOrder}
                    onShowItem={this.onShowItem}
                    item={this.state.fullItem}
                  />
                )}
              </>
            }
          />
          <Route path="/register" element={<Register />} />
        </Routes>

        {!isRegisterPage && <Footer />}
      </div>
    );
  }
}

const AppWithRouter = withRouter(App);

const AppWrapper = () => (
  <Router>
    <AppWithRouter />
  </Router>
);

export default AppWrapper;
