import React, {useState, useEffect} from 'react'
import {format, isAfter, parseISO, isBefore} from 'date-fns'



const Home = ({vaccinations, selectedDay}) => {
    const [totalGivenBy, setTotalGivenBy] = useState('')
    if (selectedDay === null) { selectedDay = format(new Date(), {representation: 'date'})} 

    useEffect(() => {
        const result = vaccinations.filter(a => isBefore(parseISO(a.vaccinationDate), parseISO(selectedDay)))
        setTotalGivenBy(result)
    }, [selectedDay, vaccinations])


    return (
        <div class="container">
        <div class="columns is-vcentered">
            <div class="column is-8">
                <div class="box">
                <p class="has-text-danger-dark is-size-4 has-text-weight-medium">Vaccination status on {selectedDay}</p>
                <p>Vaccinations given in total: {totalGivenBy.length}</p>
                <p>Zepfy: </p>
                </div>
            </div>
            <div class="column">
               <div class="box">
               <p class="has-text-danger-dark is-size-4 has-text-weight-medium">Check status for any day</p>
                </div> 
            </div>
        </div>
        <div class="columns is-vcentered">
        <div class="column is-8">
            <div class="box">
                <p class="has-text-danger-dark is-size-4 has-text-weight-medium">Order status on {selectedDay}</p>
            </div>
        </div>
        </div>
        </div>
    )
}

export default Home