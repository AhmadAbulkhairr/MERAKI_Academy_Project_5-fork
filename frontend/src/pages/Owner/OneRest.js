import React from 'react'
import { useParams } from 'react-router-dom';

const OneRest = () => {
    const {id}= useParams()
    console.log(id);
  return (
    <div>OneRest</div>
  )
}

export default OneRest