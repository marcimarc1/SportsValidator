import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { useForm } from "react-hook-form";
import Form from "react-bootstrap/Form";
import api from "../../../../api/api";
import {useState} from "react";
import { DndContext, useDraggable, useDroppable, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable } from "@dnd-kit/sortable";

import axios from "axios";
import SequenceModal from "./SequenceModal";
import form from "react-components/bundle";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    pt: 2,
    px: 4,
    pb: 3,
};


const AddVideoModal = ({modalTitle, onSave, titles, gameId}) => {
    const [open, setOpen] = React.useState(false);

    const{register, handleSubmit} = useForm()
    const[videoFile, setVideoFile] = React.useState(undefined)
    const[playerAnnotationFile, setPlayerAnnotationFile] = React.useState(undefined)
    const[ballAnnotationFile, setBallAnnotationFile] = React.useState(undefined)

    const handleOpen= () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault()
        const formData = new FormData(event.target);

        const formDto = new FormData();
        //formDto.append("title", formData.get("title"));
        //formDto.append("gameId", gameId);
        //formDto.append("sequenceNumber", titles.length+1);
        const videoMetadata = {
            name: formData.get("title"),
            game_id: gameId,
            sequence_number: titles.length+1,
        }

        formDto.append(("videoInfo"), JSON.stringify(videoMetadata))
        formDto.append("videoFile", videoFile);
        formDto.append("playerAnnotationFile", playerAnnotationFile);
        formDto.append("ballAnnotationFile", ballAnnotationFile);

        console.log("Saving Video");
        try {
            await axios.post("http://localhost:8000/video/addVideo",
                formDto,
                {headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'multipart/form-data',
                    },
                    withCredentials: true})
        }catch(err) {
            console.log(err);
        }finally {
            handleClose()
        }
    }

    return (
        <React.Fragment>
            <button className="FileButton" onClick={handleOpen}>Add Video</button>
            <Modal
                open={open}
                onClose={handleClose}
            >
                <Box sx={style}>
                    <div className="overlay">
                        <div className="modal-content"></div>
                        <h2>Add Video</h2>
                        <form onSubmit={handleFormSubmit}>
                            <div className='mb-3 mt-3'>
                                <label htmlFor='title' className="form-label">Name:</label>
                                <input type='text' className='form-control'  placeholder='Name'
                                       {...register("title")}/>
                            </div>

                            <div className='mb-3'>
                                <label className='block'>
                                    <span className='form-label'>Add Video:</span>
                                    <input
                                        type='file'
                                        id='videoFile'
                                        className="mt-1 block w-full border p-2 rounded-md"
                                        onChange={e => setVideoFile(e.target.files[0]) }/>
                                </label>
                                {videoFile && <p className="text-sm text-gray-600">Selected: {videoFile.name}</p>}
                            </div>

                            <div className='mb-3'>
                                <label className='block'>
                                    <span className='form-label'>Add Player-Annotation:</span>
                                    <input
                                        type='file'
                                        id='playerAnnotationFile'
                                        className="mt-1 block w-full border p-2 rounded-md"
                                        onChange={e => setPlayerAnnotationFile(e.target.files[0]) }/>
                                </label>
                                {playerAnnotationFile && <p className="text-sm text-gray-600">Selected: {playerAnnotationFile.name}</p>}
                            </div>
                            <div className='mb-3'>
                                <label className='block'>
                                    <span className='form-label'>Add Ball-Annotation:</span>
                                    <input
                                        type='file'
                                        id='ballAnnotationFile'
                                        className="mt-1 block w-full border p-2 rounded-md"
                                        onChange={e => setBallAnnotationFile(e.target.files[0]) }/>
                                </label>
                                {ballAnnotationFile && <p className="text-sm text-gray-600">Selected: {ballAnnotationFile.name}</p>}
                            </div>
                            <button className="FileButton" type='submit'>Save</button>
                            <button className="FileButton" onClick={handleClose}>Close</button>
                        </form>
                    </div>
                </Box>
            </Modal>
        </React.Fragment>
    );
}

export default AddVideoModal;