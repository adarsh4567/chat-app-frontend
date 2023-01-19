import { Box, Button, FormControl, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, useToast } from '@chakra-ui/react'
import axios from 'axios';
import React, { useState } from 'react'
import { ChatState } from '../../Context/ChatProvider';
import UserBadgeItem from '../UserAvatar/UserBadgeItem';
import UserListItem from '../UserAvatar/UserListItem';

const GroupChatModal = ({children}) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [groupChatName,setGroupChatName] = useState();
    const [selectedUsers,setSelectedUsers]= useState([]);
    const [search,setSearch] = useState("");
    const [searchResult,setSearchResult] = useState([]);
    const [loading,setLoading] = useState(false);
    const toast = useToast();
    const {user,chats,setChats}= ChatState();
    const handleSearch = async (query)=>{
        setSearch(query);
          if(!query){
              return;
          }
          try {
              setLoading(true);
              const config = {
                  headers:{
                      Authorization:`Bearer ${user.token}`,
                  },
              };
              const {data}= await axios.get(`${process.env.BACKEND_URL}/api/user?search=${search}`,config);
              console.log(data);
              setLoading(false)
              setSearchResult(data);
              
          } catch (error) {
              toast({
                  title:'Error Occurred',
                  description:error.message,
                  status:'error',
                  duration:5000,
                  isClosable:true,
                  position:'bottom-left'
              })
              
          }
    }
    const handleSubmit = async ()=>{
      console.log('hi');
      if(!groupChatName || !selectedUsers){
        toast({
          title:'Please fill all the fields',
          status:'warning',
          duration:5000,
          isClosable:true,
          position:'top'

        });
        return;
      }
        try {
          const config = {
            headers:{
                Authorization:`Bearer ${user.token}`,
            },
        };
        const {data} = await axios.post(`${process.env.BACKEND_URL}/api/chat/group`,{
          name:groupChatName,
          users:JSON.stringify(selectedUsers.map((u)=>u._id)),
        },config)
        setChats([data,...chats]);
        onClose();
        toast({
          title:'New GroupChat Created',
          status:'success',
          duration:5000,
          isClosable:true,
          position:'bottom'
        })
        } catch (error) {
          toast({
            title:'Failed To Create GroupChat',
            description:error.response.data,
            status:'error',
            duration:5000,
            isClosable:true,
            position:'bottom'
          })
        }
      

    }
    const handleDelete = (delUser)=>{
         setSelectedUsers(selectedUsers.filter((sel)=>sel._id !==delUser._id))
    }
    const handleGroup = (userToAdd)=>{
      if(selectedUsers.includes(userToAdd)){
        toast({
          title:'User Already Added',
          status:'warning',
          duration:5000,
          isClosable:true.valueOf,
          position:'top'
        })
      }
      setSelectedUsers([...selectedUsers,userToAdd]);
    }
    return (
        <>
          <span onClick={onOpen}>{children}</span>
    
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader
              fontSize='35px'
              fontFamily='Work sans'
              d='flex'
              justifyContent='center'
              >Create Group Chat</ModalHeader>
              <ModalCloseButton />
              <ModalBody d='flex' flexDir='column' alignItems='center'>
              <FormControl>
                  <Input placeholder='Chat Name' mb={3}
                      onChange={(e)=>setGroupChatName(e.target.value)}
                  />
              </FormControl>
              <FormControl>
                  <Input placeholder='Add Users eg:Siddhi,Adarsh,Nanhi' mb={3}
                      onChange={(e)=>handleSearch(e.target.value)}
                  />
              </FormControl>
              <Box w='100%' d='flex' flexWrap='wrap'>
              {selectedUsers.map((u)=>(
                <UserBadgeItem
                  key={user._id}
                  user={u}
                  handleFunction={()=>handleDelete(u)}
                />
              ))}
              </Box>
              {loading?<div>loading</div>:(searchResult?.slice(0,4).map(user =>(
                <UserListItem key={user._id} user={user} handleFunction={()=>handleGroup(user)}/>
              )))}
                
              </ModalBody>
    
              <ModalFooter>
                <Button colorScheme='blue' mr={3} onClick={handleSubmit}>
                  Create Chat
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      )
}

export default GroupChatModal