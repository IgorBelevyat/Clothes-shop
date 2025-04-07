import React, { Component } from 'react'

export class Catagories extends Component {
    constructor(props) {
        super(props) 
            this.state = {
                categories: [
                    {
                        key: 'all',
                        name: 'All categories'
                    },
                    {
                        key: 'T-shorts',
                        name: 'T-shorts'
                    },
                    {
                        key: 'Hoodies',
                        name: 'Hoodies'
                    },
                    {
                        key: 'Trousers',
                        name: 'Trousers'
                    },
                     {
                        key: 'Sneakers',
                        name: 'Sneakers'
                    },
                    {
                        key: 'Headwear',
                        name: 'Headwear'
                    },
                ]
            }
    }
  render() {
    return (
      <div className='categories'>
         {this.state.categories.map(el => (
            <div key={el.key} onClick={() => this.props.chooseCategory(el.key)} >{el.name}</div>
         ))}
      </div>
    )
  }
}

export default Catagories