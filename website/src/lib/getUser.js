import {connectToDB} from '@/lib/mongodb'; 
import UserModal from '@/models/User';


export const getUser = async(clerk_id) => {
  try {
    // Connect to the database
     await connectToDB();
    
    // Find the user by clerk_id
    const user = await UserModal.findOne({ clerk_id: clerk_id });
    if (!user) {
      return null;
    }

    // console.log("User found:", user);

    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}