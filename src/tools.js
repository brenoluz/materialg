
module.exports = {

  transform_date: function(value, from_format, to_format){

    if(!value){
      return null;
    }

    let mask   = from_format.split(/[-/]/g);
    let parts  = value.split(/[-/]/g);

    for(let i in mask){

      let index = parseInt(i);
     
      if(!parts[index]){
        break;
      }

      let kind = mask[index];
      let part = parts[index];
      to_format = to_format.replace(kind, part);
    }

    return to_format;
  },

  get_date_format: function(){

    return (new Date('2000/11/30')).toLocaleDateString().replace('2000','aaaa').replace('11', 'MM').replace('30','dd').replace('29', 'dd');
  }
}
