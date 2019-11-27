
module.exports = {

  transform_date: function(value, from_format, to_format){

    if(!value){
      return null;
    }

    let mask   = from_format.split(/[-/]/g);
    let parts  = value.split(/[-/]/g);

    for(let i in mask){

      index = parseInt(i);
     
      if(!parts[index]){
        break;
      }

      let kind = mask[index];
      let part = parts[index];
      to_format = to_format.replace(kind, part);
    }

    return to_format;
  }
}
