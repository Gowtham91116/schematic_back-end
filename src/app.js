const {app} = require('../index');

const PORT = 1100;

// app.get('/',(req,res)=>{
//     res.status(200).send('server running sucessfully');
// });

app.listen(PORT,()=>console.log(`App is running on PORT ${PORT}`));