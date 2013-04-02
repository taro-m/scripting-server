if (!('dataset' in ARG)) {
    ARG['error'] = 'Not dataset in ARG';
} else {
    ARG['average'] = API.average(ARG['dataset']);
}
return ARG;
