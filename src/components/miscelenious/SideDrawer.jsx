import { Avatar, Box, Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, Input, Menu, MenuButton, MenuItem, MenuList, Spinner, Text, Tooltip, useDisclosure, useToast } from '@chakra-ui/react';
import React, { useState } from 'react';
import {BellIcon,ChevronDownIcon} from '@chakra-ui/icons'
import { ChatState } from '../../Context/ChatProvider';
import ProfileModal from './ProfileModal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ChatLoading from '../ChatLoading';
import UserListItem from '../UserAvatar/UserListItem';
import { getSender } from '../../config/ChatLogics';
import { Effect } from 'react-notification-badge'
import NotificationBadge from 'react-notification-badge/lib/components/NotificationBadge';

const SideDrawer = () => {
  const [search,setSearch] = useState("");
  const [searchResult,setSearchResult]=useState([]);
  const [loading,setLoading]= useState(false);
  const [loadingChat,setLoadingChat]=useState();
  const {user,setSelectedChat,chats,setChats,notification,setNotification} = ChatState();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure()

  const logoutHandler = ()=>{
    localStorage.removeItem('userInfo');
    navigate('/');
  }
  const toast = useToast();
  const handleSearch = async()=>{
    if(!search){
      toast({
        title:'please enter something',
        status:'warning',
        duration:5000,
        isClosable:true,
        position:'top-left'

      })
    }
    try {
      setLoading(true)
      const config = {
        headers:{
          Authorization:`Bearer ${user.token}`
        },

      }
      const {data} = await axios.get(`/api/user?search=${search}`,config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title:'error occurred',
        description:'failed to load results',
        status:'error',
        duration:5000,
        isClosable:true,
        position:'bottom-left'
      })
    }
  }
  const accessChat = async (userId)=>{
        try {
          setLoadingChat(true);
          const config = {
            headers:{
              "Content-type":"application/json",
              Authorization:`Bearer ${user.token}`,
            },
    
          }
          const {data} = await axios.post('/api/chat',{userId},config);
          if(!chats.find((c)=>c._id===data._id))setChats([data,...chats]);
          
          setSelectedChat(data);
          setLoadingChat(false);
          onClose();
        } catch (error) {
          toast({
            title:'Error fetching chats',
            description:error.message,
            status:'error',
            duration:5000,
            isClosable:true,
            position:'bottom-left'
          })
        }
  }
  return( <>
     <Box
     d='flex'
     justifyContent='space-evenly'
     w='100%'
     bg='white'
     p='5px 10px 5px 10px'
     borderWidth='5px'
     alignItems='center'

     >
       <Tooltip label='Search User To Chat' hasArrow placement='bottom-end'>
         <Button variant='ghost' onClick={onOpen}>
         <i class="fa-solid fa-magnifying-glass"></i>
         <Text d={{base:'none',md:'flex'}} px='4'>Search User</Text>
         </Button>
       </Tooltip>
       <Text fontSize='2xl' fontFamily='Work sans'>
         Chat Hub
       </Text>
       <div>
         <Menu>
           <MenuButton p={1}>
           <NotificationBadge
             count={notification.length}
             effect={Effect.SCALE}
           />
              <BellIcon fontSize='2xl' m={1}/>
           </MenuButton>
           <MenuList pl={2}>
           {!notification.length && "No New Messages"}
           {notification.map((notif)=>(
             <MenuItem onClick={()=>{
               setSelectedChat(notif.chat)
               setNotification(notification.filter((n)=> n!==notif))
             }} key={notif._id}>
               {notif.chat.isGroupChat?`New Message in ${notif.chat.chatName}`:`New Message from ${getSender(user,notif.chat.users)}`}
             </MenuItem>
           ))} 
           </MenuList>
         </Menu>
         <Menu>
           <MenuButton as={Button} rightIcon={<ChevronDownIcon/>}>
             <Avatar size='sm' cursor='pointer' name={user.name}
               src={user.pic}
             />
           </MenuButton>
           <MenuList>
           <ProfileModal user={user}>
           <MenuItem>My Profile</MenuItem>
           </ProfileModal>
           <MenuItem onClick={logoutHandler}>LogOut</MenuItem>
           </MenuList>
         </Menu>
       </div>
     </Box>
     <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay/>
        <DrawerContent>
          <DrawerHeader borderBottomWidth='1px'> Search Users</DrawerHeader>
          <DrawerBody>
          <Box d='flex' pb={2}>
            <Input
              placeholder='Search by mail or name'
              mr={2}
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
            />
            <Button
             onClick={handleSearch}
             >Go</Button>
          </Box>
          {loading ? (<ChatLoading/>):(
            searchResult?.map(user =>(
              <UserListItem
                key={user._id}
                user={user}
                handleFunction={()=>accessChat(user._id)}
              />
            ))
          )}
          {loadingChat && <Spinner ml='auto' d='flex'/>}
        </DrawerBody>
        </DrawerContent>
     </Drawer>
  </>);
};

export default SideDrawer;
