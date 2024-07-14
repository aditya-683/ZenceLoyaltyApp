import React, { useState } from 'react';
import { Modal, TextField, Button, Stack ,Frame,Toast, Label} from '@shopify/polaris';
import styles from "../styles/AddChangesModal.module.css"


function AddChangesModal({ open, onClose,submitHandler ,CustomMessage}) {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [showToast, setShowToast] = useState(false);
  

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleConfirm = () => {
    // Handle the password confirmation logic here
  
    // handleToastOnAdd() // for triggering the toast function
    
    //  submitHandler()   //for sumitting the form, calling api here
     alert("Details updated")
    onClose();
  };

  const handleToastOnAdd = () => {
    const status = true
    handleToast(status)
  }

  const handleCancel = () => {
    // Handle the cancel logic here
   onClose();
  };

  const handleToastDismiss = () => {
    //console.log("inside close toast")
    setShowToast(false);
  };


  const toastMarkup = showToast ? (
    <Toast content="Password confirmed"  onDismiss={() => handleToastDismiss()} />
  ) : null;

  return (
     <div >
          
      <div>
    <Modal
      open={open}
      onClose={handleCancel}
    >
       <Modal.Section>
        <p 
        style={{fontSize:"20px",color:"rgb(5, 104, 170)",fontWeight:"bold"}}
        >  
          Please Confirm if you want to update the Details</p>
       <br></br>
         
      </Modal.Section> 
      <div>
      <button
      onClick={handleCancel}
      style={{width:"200px",color:"white",padding:"8px",backgroundColor:"rgb(5, 104, 170)",margin:"10px",fontSize:"15px"}}
      >Cancel</button>

      <button
      onClick={handleConfirm}
      style={{width:"200px",color:"white",padding:"8px",backgroundColor:"rgb(5, 104, 170)",margin:"10px",fontSize:"15px"}}
      >Confirm</button>
    </div>
    </Modal>
    </div>
    
    
    </div>

  );
}

export default AddChangesModal;
