module.exports = (req, room) => {
    if (req.price)
        room.price = req.price;
    if (req.numberOfRoom)
        room.numberOfRoom = req.numberOfRoom;
    if (req.carParking)
        room.carParking = req.carParking;
    if (req.bikeParking)
        room.bikeParking = req.bikeParking;
    if (req.address)
        room.address = req.address;
    if (req.categories)
        room.categories = req.categories;
    if (req.description)
        room.description = req.description;
    console.log('ismap', req.isMap + '   ' + req.lat + '     ' + req.lng);
    if (req.isMap)
        room.map.isMap = req.isMap;
    if (req.lat)
        room.map.lat = req.lat;
    if (req.lng)
        room.map.lng = req.lng;
    return room;
}