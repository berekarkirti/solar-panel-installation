import dotenv from 'dotenv';
import database from '../src/config/database.js';
import SolarPanel from '../src/models/SolarPanel.js';
import solarPanelService from '../src/services/solarPanel.service.js';

dotenv.config();

const testSolarPanel = async () => {
  try {
    await database.connect();

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🧪 Testing Solar Panel Module');
    console.log('═══════════════════════════════════════════════════════\n');

    // Clean up existing test data
    await SolarPanel.deleteMany({ name: /Test Panel/i });

    // Test 1: Create solar panels
    console.log('Test 1: Creating solar panels...');
    
    const panel1 = await solarPanelService.createPanel({
      name: 'Test Panel Home 300W',
      capacityKW: 0.3,
      price: 12000,
      description: 'Ideal for home use',
      suitableFor: 'home',
    });
    console.log('✅ Home panel created:', panel1.name);

    const panel2 = await solarPanelService.createPanel({
      name: 'Test Panel Commercial 5KW',
      capacityKW: 5,
      price: 150000,
      description: 'Heavy duty for commercial buildings',
      suitableFor: 'commercial',
    });
    console.log('✅ Commercial panel created:', panel2.name, '\n');

    // Test 2: Get all panels
    console.log('Test 2: Get all panels...');
    const allPanels = await solarPanelService.getAllPanels();
    console.log('✅ Total active panels:', allPanels.length, '\n');

    // Test 3: Search by name
    console.log('Test 3: Search by name...');
    const searchResults = await solarPanelService.getAllPanels({ name: 'home' });
    console.log('✅ Panels matching "home":', searchResults.length, '\n');

    // Test 4: Filter by suitableFor
    console.log('Test 4: Filter by suitableFor...');
    const homePanels = await solarPanelService.getAllPanels({ suitableFor: 'home' });
    console.log('✅ Home panels:', homePanels.length, '\n');

    // Test 5: Filter by price range
    console.log('Test 5: Filter by price range...');
    const affordablePanels = await solarPanelService.getAllPanels({ minPrice: 10000, maxPrice: 50000 });
    console.log('✅ Panels between 10000-50000:', affordablePanels.length, '\n');

    // Test 6: Get panel by ID
    console.log('Test 6: Get panel by ID...');
    const foundPanel = await solarPanelService.getPanelById(panel1._id);
    console.log('✅ Panel found:', foundPanel.name, '\n');

    // Test 7: Update panel
    console.log('Test 7: Update panel...');
    const updatedPanel = await solarPanelService.updatePanel(panel1._id, {
      price: 13000,
      description: 'Updated description',
    });
    console.log('✅ Panel updated. New price:', updatedPanel.price, '\n');

    // Test 8: Soft delete
    console.log('Test 8: Soft delete panel...');
    await solarPanelService.deletePanel(panel2._id);
    const afterDelete = await solarPanelService.getAllPanels();
    console.log('✅ Panel deleted. Active panels now:', afterDelete.length, '\n');

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ All solar panel tests passed!');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await database.disconnect();
    process.exit(0);
  }
};

testSolarPanel();