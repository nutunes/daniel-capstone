/* 
    This utils file extracts logic for creating notifications, both generally and notifications that should run once daily
*/


const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


const instruments = ['cello', 'clarinet', 'flute', 'acoustic guitar', 'electric guitar', 'organ', 'piano', 'saxophone', 'trumpet', 'Vvolin', 'singing voice']


const createNotification = async(subject, content, userId) => {
    const notification = await prisma.notification.create({
        data: {
            subject,
            content,
            userId,
            read: false,
        }
    });
    return notification.id;
}

const getDateMMDDYYYY = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${mm}/${dd}/${yyyy}`
}


// This function is the weekly update notification that will be sent to users each Monday
const weeklyNotification = async(userId) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        include: {
            likedSongs: true,
            recommendedSongs: true,
        }
    })

    const likedSongs = user.likedSongs;
    const recentSongIds = user.recentSongIds;
    const recommendedSongs = await prisma.song.findMany({
        where: {
            id: {
                in: recentSongIds
            }
        }
    })

    //Now reset recently recommended so that they are fresh for the next week
    const updatedUser = await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            recentSongIds: [],
        }
    })

    const likedInstrumentSums = new Array(instruments.length).fill(0)
    for (let song of likedSongs){
        const songInstruments = song.instruments;
        for (let i = 0; i < instruments.length; i++){
            likedInstrumentSums[i] += songInstruments[i];
        }
    }
    const likedInstrumentAvgs = likedInstrumentSums.map(sum => sum / likedSongs.length)

    const recommendedInstrumentSums = new Array(instruments.length).fill(0);
    for (let song of recommendedSongs){
        const songInstruments = song.instruments;
        for (let i = 0; i < instruments.length; i++){
            recommendedInstrumentSums[i] += songInstruments[i]
        }
    }
    const recommendedInstrumentAvgs = recommendedInstrumentSums.map(sum => sum/recommendedSongs.length)

    const instrumentDiffs = new Array(instruments.length).fill(0)
    let instrumentInfo = ``
    for (let i = 0; i < instruments.length; i++){
        instrumentDiffs[i] = likedInstrumentAvgs[i] - recommendedInstrumentAvgs[i];
        if (instrumentDiffs[i] < 0){
            instrumentInfo += ` - Less ${instruments[i]} than your liked songs\n`
        } else if (instrumentDiffs[i] > 0){
            instrumentInfo += ` - More ${instruments[i]} than your liked songs\n`
        }
        else if (instrumentDiffs[i] === 0){
            instrumentInfo += ` - The same ${instruments[i]} as your liked songs\n`
        }
    }

    //instrumentDiffs holds the differences between your liked instrument averages and your recently recommended
    //instrument averages
    const instrumentDiffAbs = instrumentDiffs.map(diff => Math.abs(diff))
    const greatestAbsDiff = Math.max(...instrumentDiffAbs)
    const greatestDiffIndex = instrumentDiffAbs.indexOf(greatestAbsDiff)
    const greatestDiffInstrument = instruments[greatestDiffIndex]
    const greatestDiff = instrumentDiffs[greatestDiffIndex]

    //Create the notification
    const today = getDateMMDDYYYY();
    const subject = 'Weekly Update ' + today;
    let content = 'On average, your recommendations from the past week have shown the following differences compared to your liked songs:\n ' + instrumentInfo + 'Like the recommendations? Go review them positively in the Profile page! Hate them? Go dislike them! All feedback you give makes the algorithm more accurate and tailored to you!';
    return await createNotification(subject, content, userId)

}


module.exports = {createNotification, weeklyNotification}