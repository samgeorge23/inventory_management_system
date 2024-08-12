"use client";
import Image from "next/image";
import {db} from "@/firebase";
import { useState, useEffect, Fragment } from "react";
import { collection, getDocs, deleteDoc, setDoc, doc} from "firebase/firestore/lite";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Box, Container, Grid, Input } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';



function Pantry({itemObj,updateData}){
  const [isEditable,setEditable] = useState(false);

  async function deletePantry(){
    try{
      await deleteDoc(doc(db,"inventory",itemObj.id)).then(updateData());
    }
    catch(error){
      alert("There is an error deleting the pantry. Try again later!");
    }
    
  }

  async function updatePantry(event){
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const jsonResult = Object.fromEntries(formData.entries());
    if(jsonResult.quantity<0){
      jsonResult.quantity = 0;
    }
    try{
      if(jsonResult.id===itemObj.id){
        await setDoc(doc(db,"inventory",itemObj.id),{image:jsonResult.image,quantity:jsonResult.quantity});
      }
      else{
        await setDoc(doc(db,"inventory",jsonResult.id),{image:jsonResult.image,quantity:jsonResult.quantity}).then(deleteDoc(doc(db,"inventory",itemObj.id)));
      }
      
    }
    catch(error){
      alert("There is an error updating the pantry. Try again later!");
    }
    setEditable(false);
    updateData();
    
  }

  function editPantry(){
    setEditable(!isEditable);
  }


  return(
  <>
    <Card sx={{ width:"15em", margin:"1em"}}>
      <div className="imageContainer">
      <CardMedia
        component="img"
        alt={itemObj.id}
        image={itemObj.image}
        className="contain"
      />
      </div>
      
        {isEditable? <>
          <CardContent>
          <form id="update-form" onSubmit={updatePantry}>
            <TextField
              autoFocus
              required
              margin="dense"
              id="name"
              defaultValue={itemObj.id}
              name="id"
              type="text"
              fullWidth
              variant="standard"
            />
            <TextField
              autoFocus
              required
              margin="dense"
              id="quantity"
              defaultValue={itemObj.quantity}
              name="quantity"
              type="number"
              fullWidth
              variant="standard"
            />
            <TextField
              autoFocus
              required
              margin="dense"
              id="imageUrl"
              defaultValue={itemObj.image}
              name="image"
              type="text"
              fullWidth
              variant="standard"
            />
          </form>
          </CardContent>
        </>:
        <>
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">{itemObj.id}</Typography>
            <Typography variant="body2" color="text.secondary">Quantity: {itemObj.quantity}</Typography>
          </CardContent>
        </>}
        
      
      <CardActions>
        <Button size="small" variant="contained" onClick={editPantry}>{isEditable?"Cancel":"Edit"}</Button>
        {isEditable?<Button size="small" variant="contained" form="update-form" type="submit">Update</Button>:<Button size="small" variant="contained" onClick={deletePantry}>Delete</Button>}
      </CardActions>
    </Card>
  </>
  );
}

function AddDataDialog({data, addFunction}){
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Fragment>
      <Button variant="contained" onClick={handleClickOpen}>
        Add Pantry
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: 'form',
          onSubmit: async (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries(formData.entries());
            const itemExists = ()=>{
              data.forEach((item)=>{if(formJson.id==item.id){
                return true;
              }});
              return false;
            }
            console.log(itemExists());
            if(!itemExists()){
              try{
                await setDoc(doc(db,"inventory",formJson.id),{quantity:formJson.quantity, image:formJson.image}).then(addFunction());
              }
              catch(error){
                alert("There is an error attempting your request! Please try again later!");
              }
              
            }
            // else{
            //   alert("The item exists already!!");
            // }
            
            handleClose();
          },
        }}
      >
        <DialogTitle>Add Item</DialogTitle>
        <DialogContent>
        <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="id"
            label="Item Name"
            type="text"
            fullWidth
            variant="standard"
          />
          <TextField
            autoFocus
            required
            margin="dense"
            id="quantity"
            name="quantity"
            label="Quantity"
            type="number"
            fullWidth
            variant="standard"
          />
          <TextField
            autoFocus
            required
            margin="dense"
            id="imageUrl"
            name="image"
            label="Image URL"
            type="text"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained" sx={{backgroundColor:"#b71c1c",":hover":{backgroundColor:"#d32f2f"}}}>Cancel</Button>
          <Button type="submit" variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}

function Board(){
  const [data, setData] = useState([]);
  const [searchResult, setSearchResult] = useState([]);

  function searchPantry(event){
    setSearchResult(data.filter((item)=>
      (item.id).includes((event.target.value).toLowerCase())
    ));
  }

  

  async function fetchData(){
    const result = await getDocs(collection(db,"inventory"))
    .then((querySnapshot)=>{
      const newData = querySnapshot.docs.map((doc)=>(
        {...doc.data(),id:doc.id}
      ));
      setData(newData);
      setSearchResult(newData);
    });
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <Box display="flex" alignItems="center" padding="0.2em" justifyContent="center" gap="1em" marginTop="0.5em">
      <AddDataDialog data={data} addFunction={fetchData}/>
      <TextField sx={{
          backgroundColor: 'white', // Sets the inner background color to white
          '& .MuiInputBase-input::placeholder': {
            fontWeight: 'bold', // Makes the placeholder text bold
          },
          '& fieldset': {
              borderColor: 'black !important', // Default border color is black
            },
            '&:hover fieldset': {
              borderColor: 'black !important', // Border color on hover is black
            },
            '&.Mui-focused fieldset': {
              borderColor: 'black !important', // Border color when focused is black
            }
        }}
        InputLabelProps={{
          style: { color: 'black' }, // Ensures the label color is black
        }}
        InputProps={{
          style: {
            backgroundColor: 'white', // Ensures the input area remains white
          },
        }}
            
            id="search"
            name="search"
            placeholder="Search the inventory"
            type="text"
            variant="outlined"
            onChange={searchPantry}
          />
      </Box>
      
      
      <Grid2 container>
        {searchResult.map((itemObj,index)=>(
          <Grid item xs={12} ms={4} key={index}>
            <Pantry key={index} itemObj={itemObj} updateData={fetchData}/>
          </Grid>
        ))}
      </Grid2>
    </div>
  );

  // <Pantry/>
}

export default function Home() {
  return (
    <>
    <Typography color="black" variant="h2" textAlign="center">Inventory Management System</Typography>
    <Board/>
    </>
    
  );
}
