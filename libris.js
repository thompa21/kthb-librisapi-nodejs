require('dotenv').config()
const axios = require("axios");

const client_id=process.env.CLIENT_ID
const client_secret=process.env.CLIENT_SECRET
const grant_type=process.env.GRANT_TYPE
const AUTH_URL = process.env.AUTH_URL
const API_URL = process.env.API_URL;

const getToken = () => axios({
    method:"POST",
    url : AUTH_URL + `?client_id=` + client_id + `&client_secret=` + client_secret + `&grant_type=` + grant_type,
    headers: {
        "content-type":"application/x-www-form-urlencoded",
    },
    params: {
        x: 's'
    }
})

const getEtag = (id) => {
    return axios({
    method:"GET",
    url : API_URL + id,
    headers: {
        "content-type":"application/json",
        "Accept":"application/ld+json"
    },
    params: {
        x: 's'
    }
    })
}

const updateHolding = (id, etag, token, json_payload) => axios({
    method:"PUT",
    url : API_URL + id,
    headers: {
        "content-type":"application/ld+json",
        "XL-Active-Sigel":"T",
        "If-Match": etag,
        "Authorization":"Bearer " + token
    },
    data: json_payload
})

const deleteHolding = (id, etag, token) => axios({
    method:"DELETE",
    url : API_URL + id,
    headers: {
        "content-type":"application/ld+json",
        "XL-Active-Sigel":"T",
        "If-Match": etag,
        "Authorization":"Bearer " + token
    }
})

const findHoldinguri = (id, type) => {
    if (type == 'libris3') {
        apiurl = API_URL + 'find.jsonld?meta.identifiedBy.@type=LibrisIIINumber&meta.identifiedBy.value=' + id //+ '&@reverse.itemOf.heldBy.@id=https://libris.kb.se/library/Te'
    }
    if (type == 'bibid') {
        apiurl = API_URL + 'find.jsonld?meta.controlNumber=' + id //+ '&@reverse.itemOf.heldBy.@id=https://libris.kb.se/library/Te'
    }
    console.log(apiurl)
    return axios({
        method:"GET",
        url : apiurl,
        headers: {
            "content-type":"application/json"
        },   
        data: ''
    })
}

exports.getToken = getToken;

exports.getEtag = getEtag;

exports.updateHolding = updateHolding;

exports.deleteHolding = deleteHolding;

exports.findHoldinguri = findHoldinguri;
