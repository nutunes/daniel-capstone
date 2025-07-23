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


const dailyNotification = async(userId) => {
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

    for (let i = 0; i < instruments.length; i++){
        instrumentDiffs[i] = likedInstrumentAvgs[i] - recommendedInstrumentAvgs[i];
    }

    //instrumentDiffs holds the differences between your liked instrument averages and your recently recommended
    //instrument averages
    const instrumentDiffAbs = instrumentDiffs.map(diff => Math.abs(diff))
    const greatestAbsDiff = Math.max(...instrumentDiffAbs)
    const greatestDiffIndex = instrumentDiffAbs.indexOf(greatestAbsDiff)
    const greatestDiffInstrument = instruments[greatestDiffIndex]
    const greatestDiff = instrumentDiffs[greatestDiffIndex]

    //Create the notification
    const subject = 'Weekly Update';
    let content = '';
    if (greatestDiff > 0){
        content = `Your recommendations from the past week have had more ${greatestDiffInstrument} than any other instrument in your liked songs!
        Like the recommendations? Go review them positively in the Profile page! Hate them? Go dislike them! All feedback
        you give makes the algorithm more accurate and tailored to you!`
    } else{
        content = `Your recommendations from the past week have had less ${greatestDiffInstrument} than any other instrument in your liked songs!
        Like the recommendations? Go review them positively in the Profile page! Hate them? Go dislike them! All feedback
        you give makes the algorithm more accurate and tailored to you!`
    }
    return await createNotification(subject, content, userId)

}


module.exports = {createNotification, dailyNotification}