import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { firestore } from '../config/firebaseConfig';

export async function fetchAndScheduleTasks(userId, scheduleId) {
  try {
    const tasksRef = collection(firestore, 'users', userId, 'schedules', scheduleId, 'tasks');
    const freeTimeSlotsRef = collection(firestore, 'users', userId, 'freetimeslots');
    const eventsRef = collection(firestore, 'users', userId, 'schedules', scheduleId, 'events');

    const tasksSnapshot = await getDocs(tasksRef);
    let tasks = [];
    tasksSnapshot.forEach(doc => {
      let task = doc.data();
      task.id = doc.id;
      task.dueDate = task.dueDate.toDate();
      tasks.push(task);
    });

    const freeTimeSlotsSnapshot = await getDocs(freeTimeSlotsRef);
    let freeTimeSlots = [];
    freeTimeSlotsSnapshot.forEach(doc => {
      let slot = doc.data();
      slot.id = doc.id;
      freeTimeSlots.push(slot);
    });

    const eventsSnapshot = await getDocs(eventsRef);
    let events = [];
    eventsSnapshot.forEach(doc => {
      let event = doc.data();
      event.id = doc.id;
      event.startTime = event.startTime.toDate();
      event.endTime = event.endTime.toDate();
      events.push(event);
    });

    tasks.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      } else if (a.dueDate !== b.dueDate) {
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else {
        return a.difficulty - b.difficulty;
      }
    });

    console.log('Sorted tasks:', tasks);
    console.log('Free time slots:', freeTimeSlots);
    console.log('Events:', events);

    for (let task of tasks) {
      console.log(`Scheduling task: ${task.title} with dueDate: ${task.dueDate}`);
      for (let slot of freeTimeSlots) {
        console.log(`Checking slot: ${slot.id}, startTime: ${slot.startTime}, endTime: ${slot.endTime}, isCustom: ${slot.isCustom}`);
        if (slot.isCustom || isValidWeeklySlot(slot, task.dueDate)) {
          let taskDuration = parseFloat(task.duration) * 60;
          let slotStartTime = slot.startTime;
          let slotEndTime = slot.endTime;

          console.log(`Slot start time: ${slotStartTime}, slot end time: ${slotEndTime}, task duration: ${taskDuration}`);
          if ((slotEndTime - slotStartTime) >= taskDuration) {
            let startTime = getSlotDate(slot, task.dueDate, slot.startTime);
            let endTime = addMinutes(startTime, taskDuration);

            if (endTime <= getSlotDate(slot, task.dueDate, slot.endTime) && !isClashingWithEvents(startTime, endTime, events)) {
              console.log(`Task: ${task.title}`);
              console.log(`Planned Start Time: ${startTime.toISOString()}`);
              console.log(`Planned End Time: ${endTime.toISOString()}`);

              await updateDoc(doc(firestore, 'users', userId, 'schedules', scheduleId, 'tasks', task.id), {
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString()
              });

              slot.startTime = getSlotTimeInMinutes(endTime); 
              break;
            } else {
              console.log('End time exceeds slot end time or clashing with an event');
            }
          } else {
            console.log('Slot duration is less than task duration');
          }
        } else {
          console.log('Slot is not valid for the task due date');
        }
      }
    }
  } catch (error) {
    console.error('Error scheduling tasks:', error);
  }
}

function isValidWeeklySlot(slot, dueDate) {
  let taskDate = new Date(dueDate);
  let taskDay = taskDate.getDay(); 

  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  let slotDayIndex = daysOfWeek.indexOf(slot.dayOfWeek.toLowerCase());

  if (slotDayIndex === -1) {
    console.error(`Invalid day of the week specified in time slot: ${slot.dayOfWeek}`);
    return false;
  }


  return slotDayIndex < taskDay;
}

function isClashingWithEvents(startTime, endTime, events) {
  for (let event of events) {
    if ((startTime >= event.startTime && startTime < event.endTime) ||
        (endTime > event.startTime && endTime <= event.endTime) ||
        (startTime <= event.startTime && endTime >= event.endTime)) {
      return true;
    }
  }
  return false;
}

function getSlotTimeInMinutes(date) {
  return date.getHours() * 60 + date.getMinutes();
}

function getSlotDate(slot, dueDate, slotTimeInMinutes) {
  let date = new Date(dueDate);
  
  let currentDay = date.getDay(); 

  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  let slotDayIndex = daysOfWeek.indexOf(slot.dayOfWeek.toLowerCase());

  let dayDifference = slotDayIndex - currentDay;
  
  date.setDate(date.getDate() + dayDifference);

  let hours = Math.floor(slotTimeInMinutes / 60);
  let minutes = slotTimeInMinutes % 60;
  date.setHours(hours, minutes, 0, 0);

  return date;
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}
