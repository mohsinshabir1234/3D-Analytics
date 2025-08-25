import geoip from 'geoip-lite';


export default function geo_lookup(ip_address){
    //remember if ip is private, it will show null
var geo = geoip.lookup(ip_address);

console.log("This is ",geo)
return geo
}