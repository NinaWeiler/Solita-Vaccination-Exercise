import React, {useState, useEffect} from 'react'
import { parseISO, isBefore, isAfter, addDays, isSameDay, subDays} from 'date-fns'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css";
import '../components/CalendarStyle.css'
import orderService from '../services/orders'
import { Table, DetailsTable } from '../components/Table'
import CircularProgress from '@material-ui/core/CircularProgress';
import {useSelector, useDispatch} from 'react-redux'
import {selectDay, selectedDayThis} from '../state/daySlice'


const initialState = {
    totalGivenBy: [],
    totalArrivedBy:[],
    orderToCome: [],
    givenToday: [],
    arrivedToday: [],
    bottlesExpired: [],
    bottlesExpiredToday : [],
    expiresin10Days: 0
}

const initialBrandDetails = {
    zerpfyArrived: {totalOrders: 0, totalInjections: 0, todaysOrders: 0, todaysInjections: 0},
    zerpfyExpired: 0,
    antiquaArrived:{totalOrders: 0, totalInjections: 0, todaysOrders: 0, todaysInjections: 0},
    antiquaExpired: 0, 
    solarBuddhicaArrived: {totalOrders: 0, totalInjections: 0, todaysOrders: 0, todaysInjections: 0},
    solarBuddhicaExpired: 0,
    totalExpiredToday: 0
}


const Home = ({vaccinations, orders, loading}) => {
    const day = useSelector(selectDay)
    const dispatch = useDispatch()
    const [state, setState] = useState(initialState)
    const [brandDetails, setBrandDetails] = useState(initialBrandDetails)
    const [showDetails, setShowDetails] = useState(false)

    const sumReducer = (sum, value) => {
        return sum + value
    } 
   
    const totalGiven = () => vaccinations.filter(a => isBefore(parseISO((a.vaccinationDate).slice(0, -8)), (addDays(parseISO(day), 1))))
    const totalArrived = () => orders.filter(o => isBefore(parseISO((o.arrived).slice(0, -8)), (addDays(parseISO(day), 1))))
    const ordersToCome = () => orders.filter(o => isAfter((parseISO((o.arrived).slice(0,-8))), (addDays((parseISO(day)), 1))))
    const givenToday = () => vaccinations.filter(v => isSameDay(parseISO((v.vaccinationDate).slice(0, -8)), parseISO(day)))
    const arrivedToday = () => orders.filter(o => isSameDay(parseISO((o.arrived).slice(0, -8)), parseISO(day)))
    const bottlesExpired = () => orders.filter(o => isBefore(parseISO((o.arrived).slice(0, -8)), subDays(parseISO(day), 29)))
    const bottlesExpiredOnToday = () => orders.filter(o => isSameDay(parseISO((o.arrived).slice(0, -8)), subDays(parseISO(day), 30)))
   
    const InjectionsArrived = brandDetails.zerpfyArrived.totalInjections + brandDetails.antiquaArrived.totalInjections + brandDetails.solarBuddhicaArrived.totalInjections
    const InjectionsArrivedToday = brandDetails.zerpfyArrived.todaysInjections + brandDetails.antiquaArrived.todaysInjections + brandDetails.solarBuddhicaArrived.todaysInjections


    const countBrandDetails = () => {
        const orderBrand = (brand) => totalArrived().filter(v => v.vaccine === brand)
        const orderBrandToday = (brand) => arrivedToday().filter(v => v.vaccine === brand)
        const totalInjections = (brand) =>  orderBrand(brand).map(a => a.injections).reduce(sumReducer, 0)
        const todaysInjections = (brand) => orderBrandToday(brand).map(a => a.injections).reduce(sumReducer, 0)
        expiredToday()
        console.log('branddetails', orderBrandToday('Zerpfy'))

        setBrandDetails(prevState => ({
            ...prevState,
            zerpfyArrived: {totalOrders: orderBrand('Zerpfy').length , totalInjections: totalInjections('Zerpfy'), todaysOrders: orderBrandToday('Zerpfy').length, todaysInjections: todaysInjections('Zerpfy')},
            antiquaArrived: {totalOrders: orderBrand('Antiqua').length , totalInjections: totalInjections('Antiqua'), todaysOrders: orderBrandToday('Antiqua').length, todaysInjections: todaysInjections('Antiqua')},
            solarBuddhicaArrived: {totalOrders: orderBrand('SolarBuddhica').length , totalInjections: totalInjections('SolarBuddhica'), todaysOrders: orderBrandToday('SolarBuddhica').length, todaysInjections: todaysInjections('SolarBuddhica')},

        }))
    }

    const expiredToday = async () => {
        const data = await orderService.expiredToday(day)
        const filterBrand = (brand) => data.filter(d => d.vaccine === brand)
        console.log('counting expiredToday')
        setBrandDetails(prevState => ({
            ...prevState,
            totalExpiredToday: data.map(d => d.expired).reduce(sumReducer, 0),
            zerpfyExpired: filterBrand('Zerpfy').map(v => v.expired).reduce(sumReducer, 0),
            antiquaExpired: filterBrand('Antiqua').map(v => v.expired).reduce(sumReducer, 0),
            solarBuddhicaExpired: filterBrand('SolarBuddhica').map(v => v.expired).reduce(sumReducer, 0)
        }))
    }
    
    const expiresSoon = async () => {
        const data = await orderService.expiresIn10Days(day)
        console.log('counting expires soon')
        setState(prevState =>    ({
            ...prevState, 
            expiresin10Days: data.map(d => d.injections - d.vaccines).reduce(sumReducer, 0)
        }))
    } 
    
    
    useEffect(() => {
        async function fetchData()  {
             setState( prevState => ({
                ...prevState,
                totalGivenBy: totalGiven(),
                totalArrivedBy: totalArrived(),
                givenToday: givenToday(),
                arrivedToday: arrivedToday(),
                ordersToCome: ordersToCome(),
                expiredBottles: bottlesExpired(),
                bottlesExpiredToday: bottlesExpiredOnToday(),
            }))
            expiresSoon()
            console.log('fetching done')
        }
        fetchData()

    }, [day, vaccinations, orders])

    useEffect(() => {
        countBrandDetails()
    }, [showDetails])

    const handleOnClick = () => {
        setShowDetails(!showDetails)
    }

    return (
        <div class="container">
        <div class="columns">
            <div class="column is-8">
                <div class="box" style={{minHeight: '350px'}}>
                {loading ? <CircularProgress color='info'/> 
                : 
                <>
                {state.totalArrivedBy.length > 0 ? 
                <>
                <p class="has-text-danger-dark is-size-4 has-text-weight-medium" style={{marginBottom: '40px'}}>Status of Orders and Vaccinations</p>
                <Table state={state} day={day}/>
                {showDetails ? 
                <>  
                <div class='content has-text-centered'>
                    <button class='button is-danger is-light' onClick={handleOnClick}>Hide details</button> 
                    </div>
                    <p class="has-text-danger-dark is-size-5 " style={{marginBottom: '40px'}}>Details per producer</p>
                    <DetailsTable state={state} brandDetails={brandDetails} InjectionsArrived={InjectionsArrived}
                        InjectionsArrivedToday={InjectionsArrivedToday} day={day}/>
                </>
                :
                <div class='content has-text-centered'>
                <button class='button is-danger is-light' onClick={handleOnClick}>Show details</button> 
                </div>
                }
                
                </>
                : null }
                </>
                }
                </div>
            </div>
            <div class="column">
               <div class="box">
               <p class="has-text-danger-dark is-size-4 has-text-weight-medium">Check status for any day</p>
                <DatePicker 
                selected={parseISO(day)} 
                onChange={(d) => dispatch(selectedDayThis(d.toString()))} 
                inline
                minDate={new Date('2021-01-02')}
                maxDate={new Date('2021-04-13')}
                />
                </div> 
            </div>
        </div>
        </div>
    )
}

export default Home