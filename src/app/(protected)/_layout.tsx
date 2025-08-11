import { useAuth } from "@/providers/AuthProvider";
import { Redirect, Slot, Stack } from "expo-router";

export default function ProtectedLayout(){

const { isAuthenticated } = useAuth();

if(!isAuthenticated){
  return <Redirect href="/sign-in" />;
}
  return (
    <Slot />
  );  
}