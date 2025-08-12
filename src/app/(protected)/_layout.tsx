import { Redirect, Slot, Stack } from "expo-router";
import { useAuth } from '@clerk/clerk-expo';

export default function ProtectedLayout(){

const { isSignedIn } = useAuth();

if(!isSignedIn){
  return <Redirect href="/sign-in" />;
}
  return (
    <Slot />
  );  
}