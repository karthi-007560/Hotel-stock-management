import React,{useEffect,useState}from'react';
import{Plus,Search,Pencil,Trash2,X,Package,Boxes,AlertTriangle}from'lucide-react';
import{Header,Panel,Button}from'../../components/UI/UI';
import{getInventory,saveInventory,money,uid}from'../../utils/store';
import'./Inventory.css';

export default function Inventory(){
  const[items,setItems]=useState([]);
  const[q,setQ]=useState('');
  const[open,setOpen]=useState(false);
  const[edit,setEdit]=useState(null);

  const empty={
    name:'',
    category:'Grocery',
    unit:'KG',
    current:'',
    minimum:'',
    price:''
  };

  const[form,setForm]=useState(empty);

  const load=()=>{
    setItems(getInventory());
  };

  useEffect(()=>{
    load();

    window.addEventListener('hotel_data_updated',load);

    return()=>{
      window.removeEventListener('hotel_data_updated',load);
    };
  },[]);

  const showAdd=()=>{
    setEdit(null);
    setForm(empty);
    setOpen(true);
  };

  const showEdit=x=>{
    setEdit(x.id);
    setForm({...x});
    setOpen(true);
  };

  const close=()=>{
    setOpen(false);
    setEdit(null);
    setForm(empty);
  };

  const submit=e=>{
    e.preventDefault();

    if(!form.name.trim()){
      return alert('Enter item name');
    }

    const x={
      id:edit||uid('item'),
      name:form.name.trim(),
      category:form.category,
      unit:form.unit,
      current:Number(form.current)||0,
      minimum:Number(form.minimum)||0,
      price:Number(form.price)||0
    };

    const next=edit
      ?items.map(i=>i.id===edit?x:i)
      :[...items,x];

    saveInventory(next);
    close();
  };

  const del=id=>{
    const x=items.find(i=>i.id===id);

    if(x&&window.confirm(`Delete ${x.name}?`)){
      saveInventory(items.filter(i=>i.id!==id));
    }
  };

  const filtered=items.filter(x=>
    x.name.toLowerCase().includes(q.toLowerCase())||
    x.category.toLowerCase().includes(q.toLowerCase())
  );

  const lowStock=items.filter(
    x=>Number(x.current)<=Number(x.minimum)
  ).length;

  return(
    <div className="page inventoryPage">

      <Header
        eyebrow="Inventory"
        title="Stock inventory"
        subtitle="Manage your products, stock levels and minimum limits."
        action={
          <Button onClick={showAdd}>
            <Plus size={14}/>
            Add Item
          </Button>
        }
      />

      {/* TOP SUMMARY */}

      <div className="inventoryStats">

        <div className="inventoryStatCard">
          <div className="inventoryStatIcon blue">
            <Boxes size={20}/>
          </div>

          <div>
            <span>Total Products</span>
            <strong>{items.length}</strong>
            <small>Saved products</small>
          </div>
        </div>

        <div className="inventoryStatCard">
          <div className="inventoryStatIcon orange">
            <AlertTriangle size={20}/>
          </div>

          <div>
            <span>Low Stock</span>
            <strong>{lowStock}</strong>
            <small>Need attention</small>
          </div>
        </div>

        <div className="inventoryStatCard">
          <div className="inventoryStatIcon green">
            <Package size={20}/>
          </div>

          <div>
            <span>Available Stock</span>
            <strong>
              {items.reduce(
                (a,x)=>a+Number(x.current||0),
                0
              )}
            </strong>
            <small>Total quantity</small>
          </div>
        </div>

      </div>


      {/* INVENTORY TABLE */}

      <Panel
        title={`All items (${items.length})`}
        action={
          <div className="search">
            <Search size={14}/>
            <input
              placeholder="Search items..."
              value={q}
              onChange={e=>setQ(e.target.value)}
            />
          </div>
        }
      >

        <div className="tableWrap inventoryTableWrap">

          <table className="table inventoryTable">

            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Unit</th>
                <th>Current</th>
                <th>Minimum</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {filtered.length?

                filtered.map(x=>{

                  const low=
                    Number(x.current)<=Number(x.minimum);

                  return(

                    <tr key={x.id}>

                      <td className="item">
                        <div className="productCell">

                          <div className="productIcon">
                            <Package size={15}/>
                          </div>

                          <div>
                            <b>{x.name}</b>
                            <small>
                              {x.category}
                            </small>
                          </div>

                        </div>
                      </td>

                      <td>
                        <span className="categoryText">
                          {x.category}
                        </span>
                      </td>

                      <td>
                        <span className="unitTag">
                          {x.unit}
                        </span>
                      </td>

                      <td>
                        <strong className={low?'stockLow':'stockGood'}>
                          {x.current}
                        </strong>
                      </td>

                      <td>
                        {x.minimum}
                      </td>

                      <td>
                        <strong>
                          {money(x.price)}
                        </strong>
                      </td>

                      <td>

                        <span
                          className={
                            'badge '+
                            (low?'orangeB':'greenB')
                          }
                        >
                          {low?'Low Stock':'In Stock'}
                        </span>

                      </td>

                      <td>

                        <div className="actionBtns">

                          <button
                            onClick={()=>showEdit(x)}
                            title="Edit"
                            className="editBtn"
                          >
                            <Pencil size={14}/>
                          </button>

                          <button
                            onClick={()=>del(x.id)}
                            title="Delete"
                            className="deleteBtn"
                          >
                            <Trash2 size={14}/>
                          </button>

                        </div>

                      </td>

                    </tr>

                  );

                })

                :

                <tr>
                  <td
                    colSpan="8"
                    className="empty"
                  >
                    No products yet. Click Add Item to create your first product.
                  </td>
                </tr>

              }

            </tbody>

          </table>

        </div>

      </Panel>


      {/* ADD / EDIT MODAL */}

      {open&&(

        <div
          className="modalOverlay"
          onClick={close}
        >

          <div
            className="modalCard inventoryModal"
            onClick={e=>e.stopPropagation()}
          >

            <div className="modalHead">

              <div>

                <span className="welcome">
                  INVENTORY
                </span>

                <h2>
                  {edit?'Edit Product':'Add Product'}
                </h2>

                <p>
                  {edit
                    ?'Update product information and stock limits.'
                    :'Add a new product to your inventory.'}
                </p>

              </div>

              <button
                className="iconClose"
                onClick={close}
              >
                <X size={18}/>
              </button>

            </div>


            <form
              className="modalForm"
              onSubmit={submit}
            >

              <label>
                Product name

                <input
                  value={form.name}
                  onChange={e=>
                    setForm({
                      ...form,
                      name:e.target.value
                    })
                  }
                  placeholder="Basmati Rice"
                  required
                />

              </label>


              <div className="modalGrid">

                <label>
                  Category

                  <select
                    value={form.category}
                    onChange={e=>
                      setForm({
                        ...form,
                        category:e.target.value
                      })
                    }
                  >

                    {[
                      'Grocery',
                      'Meat',
                      'Dairy',
                      'Vegetables',
                      'Beverages',
                      'Cleaning',
                      'Other'
                    ].map(x=>
                      <option key={x}>
                        {x}
                      </option>
                    )}

                  </select>

                </label>


                <label>
                  Unit

                  <select
                    value={form.unit}
                    onChange={e=>
                      setForm({
                        ...form,
                        unit:e.target.value
                      })
                    }
                  >

                    {[
                      'KG',
                      'Litre',
                      'Piece',
                      'Box',
                      'Packet'
                    ].map(x=>
                      <option key={x}>
                        {x}
                      </option>
                    )}

                  </select>

                </label>

              </div>


              <div className="modalGrid">

                <label>
                  Current stock

                  <input
                    type="number"
                    min="0"
                    value={form.current}
                    onChange={e=>
                      setForm({
                        ...form,
                        current:e.target.value
                      })
                    }
                  />

                </label>


                <label>
                  Minimum stock

                  <input
                    type="number"
                    min="0"
                    value={form.minimum}
                    onChange={e=>
                      setForm({
                        ...form,
                        minimum:e.target.value
                      })
                    }
                  />

                </label>

              </div>


              <label>
                Price per unit

                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={e=>
                    setForm({
                      ...form,
                      price:e.target.value
                    })
                  }
                />

              </label>


              <div className="modalActions">

                <button
                  type="button"
                  className="cancel"
                  onClick={close}
                >
                  Cancel
                </button>

                <button
                  className="save"
                >
                  {edit
                    ?'Update Product'
                    :'Save Product'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}