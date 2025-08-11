import { Slot, Stack } from "expo-router";

export default function ProtectedLayout(){

    console.log("Pagina protegida");
  return (
    <Slot />
  );  
}