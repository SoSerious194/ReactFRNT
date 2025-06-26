"use server";

import { USER_ROLES } from "@/lib/constant";
import { createClient } from "@/utils/supabase/server";

export const getClients = async () => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("users")
      .select("*, user_roles!inner(role)")
      .eq("user_roles.role", USER_ROLES.CLIENT)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return {
      data: data,
      success: true,
      message: "Clients fetched successfully",
    };

  } catch (error) {
    console.error("Error in getClients:", error);
    return {
      data: [],
      success: false,
      message: "Failed to fetch clients",
    };
  }
};


export const getConversationId = async (clientId: string) => {
  try {
    const supabase = await createClient();

    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError) {
      throw new Error(userError.message);
    }

    if (!user.user?.id || !clientId) {
      return null;
    }

    const { data, error } = await supabase.rpc("get_or_create_conversation", {
      user_a: user.user?.id,
      user_b: clientId,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;

    
  } catch (error) {
    console.error("Error in getConversationId:", error);
    return null;
  }
}


export const sendMessage = async (conversationId: string, message: string) => {
  try {
    const supabase = await createClient();


    const { data, error } = await supabase.rpc("send_message", {
      p_conversation_id: conversationId,
      p_content: message,
      p_message_type: "text",
    });

    
    if (error) {
      throw new Error(error.message);
    }

    return {
      data: data, 
      success: true,
      message: "Message sent successfully",
    };
    
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return {
      data: null,
      success: false,
      message: "Failed to send message",
    };
  }
}

export const getMessages = async (conversationId: string, from: number, to: number) => {
  try {
    const supabase = await createClient();    

    const { data, error, count } = await supabase.from("messages")
          .select("*",{count: "exact"}).eq("conversation_id", conversationId)
          .order("created_at", { ascending: false })
          .range(from, to);

    if (error) {  
      throw new Error(error.message);
    }

    return {
      data: data,
      count,
      success: true,
      message: "Messages fetched successfully",
    };
  } catch (error) {
    console.error("Error in getMessages:", error);
    return {
      data: [],
      count: 0,
      success: false,
      message: "Failed to fetch messages",
    };
  }
}


export const getUserId = async () => {
  const supabase = await createClient();
  const { data: user, error: userError } = await supabase.auth.getUser();
  return user.user?.id;
}
